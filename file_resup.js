/**
 * @file
 * Written by Henri MEDOT <henri.medot[AT]absyx[DOT]fr>
 * http://www.absyx.fr
 */

(function($, Drupal) {
  'use strict';

  // Static variable.
  var _index = 0;

  // Helper functions.
  var formatSize = function(size) {
    if (size < 1024) {
      return Drupal.formatPlural(size, '1 byte', '@count bytes');
    }
    else {
      size /= 1024;
      var units = [Drupal.t('@size KB'), Drupal.t('@size MB'), Drupal.t('@size GB')], roundedSize, i, len;
      for (i = 0, len = units.length; i < len; i++) {
        roundedSize = Math.round(size * 100) / 100;
        if (roundedSize < 1024) {
          break;
        }
        size /= 1024;
      }
      return units[i].replace('@size', roundedSize);
    }
  };

  var updateFileList = function(r, $drop) {
    $('.file-list', $drop).remove();
    if (r.files.length) {
      var $ul = $('<ul class="file-list"></ul>');
      $.each(r.files, function(i, file) {
        var $remove = $('<a href="#" class="remove"><span>(-)</span></a>').attr('title', Drupal.t('Remove file')).click(function(e) {
          clearErrors($drop.parent());
          r.removeFile(file);
          updateFileList(r, $drop);
          e.preventDefault();
        });
        $ul.append($('<li>' + Drupal.checkPlain(file.name) + ' <strong>(' + formatSize(file.size) + ')</strong></li>').prepend($remove));
      });
      $drop.prepend($ul);
    }
    updateUploadButton($drop.siblings('.button.upload'), r);
  };

  var clearErrors = function($wrapper) {
    $('.file-upload-js-error', $wrapper).remove();
  };

  var addError = function($wrapper, error) {
    var $messages = $('.file-upload-js-error', $wrapper);
    if (!$messages.length) {
      $wrapper.prepend('<div class="messages error file-upload-js-error">' + error + '</div>');
    }
    else {
      var $ul = $messages.children('ul');
      if (!$ul.length) {
        $messages.html('<ul><li>' + $messages.html() + '</li><li>' + error + '</li></ul>');
      }
      else {
        $ul.append('<li>' + error + '</li>');
      }
    }
  };

  var updateUploadButton = function($upload, r) {
    var uploading = r.uploading;
    $upload.html('<span>' + (uploading ? Drupal.t('Cancel') : Drupal.t('Upload')) + '</span>').toggleClass('cancel', uploading).toggleClass('disabled', !r.files.length);
  };

  // Drupal behavior.
  Drupal.behaviors.fileResup = {
    attach: function(context, settings) {
      $('.file-resup', context).once('file-resup', function() {
        this.id = 'file-resup-' + _index++;
        var $this = $(this).val('');
        var $wrapper = $this.closest('.file-resup-wrapper');
        var bar, completing;

        // Ensure browser supports Resup.
        if (!Resup.support) {
          $this.attr('disabled', 'disabled');
          $wrapper.hide();
          return;
        }

        // Hide the default upload elements.
        var $uploadField = $('input[name="' + $this.data('upload-name') + '"]').hide();
        var $uploadButton = $('input[name="' + $this.data('upload-button-name') + '"]').hide();

        // Disable the default progress indicator.
        Drupal.ajax[$uploadButton.attr('id')].progress.type = 'none';

        // Replace the description.
        var $item = $wrapper.closest('.form-item');
        $item.find('.description:first').html($this.data('description'));

        // Replace the title.
        var maxFiles = $this.data('max-files');
        if (maxFiles != 1) {
          var $title = $item.find('label:first');
          if ($.trim($title.text()) == Drupal.t('Add a new file')) {
            $title.text(Drupal.t('Add new files'));
          }
        }

        // Add the drop area.
        var $drop = $('<div class="item-list drop"><div class="drop-message">' + $this.data('drop-message') + '</div></div>').bind('drop', function(e) {
          clearErrors($wrapper);
          e.preventDefault();
        }).appendTo($wrapper);

        // Get the maximum file size and allowed extensions.
        var maxFileSize = $this.data('max-filesize');
        var extensions = $this.data('extensions').split(',');

        // Instanciate a new Resup object.
        var r = new Resup($this.data('url'), {
          chunkSize: settings.file_resup.chunk_size,
          maxFiles: maxFiles,
          maxFileSize: maxFileSize,
          extensions: extensions,
          query: {
            form_build_id: $('input[name="form_build_id"]', this.form).val()
          },
          fileValidator: function(file) {
            if (file.name.length <= 240) {
              return true;
            }
            addError($wrapper, Drupal.t('File name %filename exceeds the 240 characters limit.', {'%filename': file.name}));
          },
          drop: $drop.get(0)
        });
        var $input = $(r.input).addClass('element-invisible');

        // Add the Browse button.
        $('<a href="#" class="button browse"><span>' + Drupal.t('Browse') + '</span></a>').click(function(e) {
          clearErrors($wrapper);
          $input.click();
          e.preventDefault();
        }).appendTo($wrapper).after($input);

        // Add the Upload button.
        var $upload = $('<a href="#" class="button upload disabled"><span>' + Drupal.t('Upload') + '</span></a>').click(function(e) {
          if (!completing) {
            if (r.uploading) {
              r.stop();
              bar.element.hide();
              updateUploadButton($upload, r);
            }
            else if (r.files.length) {
              clearErrors($wrapper);
              if (!bar) {
                bar = new Drupal.progressBar('ajax-progress-' + $this.attr('id'));
                $drop.after(bar.element);
              }
              bar.setProgress(0, Drupal.t('Starting upload...'));
              bar.element.show();
              r.retry();
              updateUploadButton($upload, r);
            }
          }
          e.preventDefault();
        }).appendTo($wrapper);

        // Handle the resupaddedfileerror event.
        r.onresupaddedfileerror = function(file, error) {
          addError($wrapper, error == 'size' ? Drupal.t('File %filename is %filesize, exceeding the maximum file size of %maxsize.', {
              '%filename': file.name,
              '%filesize': formatSize(file.size),
              '%maxsize': formatSize(maxFileSize)
            }) : Drupal.t('File %filename cannot be uploaded. Only files with the following extensions are allowed: %extensions.', {
              '%filename': file.name,
              '%extensions': extensions.join(', ')
            })
          );
        };

        // Handle the resupfilesadded event.
        r.onresupfilesadded = function(addedFiles, skipped) {
          if (skipped > 1 && $('.file-upload-js-error', $wrapper).length) {
            addError($wrapper, Drupal.t('@count files in total were skipped.', {'@count': skipped}));
          }
          if (addedFiles.length) {
            updateFileList(r, $drop);
          }
        };

        // Handle the resupprogress event.
        r.onresupprogress = function() {
          var p = r.getProgress();
          var message = p < 1 ? Drupal.t('Uploading...') : Drupal.t('Completing upload...');
          bar.setProgress((Math.round(p * 1000) / 10).toFixed(1), message);
        };

        // Handle the resupended event.
        r.onresupended = function(completeFiles) {
          if (completeFiles.length) {
            completing = true;
            $upload.addClass('disabled');
            var ids = [];
            $.each(completeFiles, function(i, file) {
              ids.push(file.id);
            });
            $this.val(ids.join(','));
            $uploadField.attr('disabled', 'disabled');
            $uploadButton.mousedown();
          }
          else {
            bar.element.hide();
          }
        };

        // Handle the resupfileerror event.
        r.onresupfileerror = function(file) {
          r.stop();
          bar.element.hide();
          updateUploadButton($upload, r);
          addError($wrapper, Drupal.t('An error occurred while uploading file %filename. Please click <em>Upload</em> to retry.', {'%filename': file.name}));
        };

        // Prevent form submissions during uploads.
        $(this.form).bind('submit.' + this.id, function(e) {
          if (r.uploading || completing) {
            alert(Drupal.t('Files are currently being uploaded. Please stand by...'));
            e.stopImmediatePropagation();
            return false;
          }
        });

        // Stop uploads before unloading the page.
        $(window).bind('beforeunload.' + this.id, function() {
          r.stop();
        });
      });
    },
    detach: function(context, settings, trigger) {
      if (trigger == 'unload') {
        $('.file-resup', context).each(function() {
          var namespace = '.' + this.id;
          $(this.form).unbind(namespace);
          $(window).unbind(namespace);
        });
      }
    }
  };

})(jQuery, Drupal);
