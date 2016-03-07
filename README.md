File Resup
---------------------

File Resup is a multi-file or multi-image upload solution for Backdrop CMS.

CONTENTS OF THIS FILE
---------------------

 - Introduction
 - Tested
 - Known Issues
 - Special Thanks
 - Requirements
 - Installation
 - Coming From Drupal?
 - Usage
 - License
 - Credits
 - Maintainers

TESTED
-----

This module has been tested working in Backdrop 1.3 uploading images and using the settings form.

KNOWN ISSUES
---------------------

none

SPECIAL THANKS
--------------

This module port has been sponsored by VR Sites. (http://beta.vrsites.com)  Special thanks to them!

Special thanks to gifad <https://github.com/gifad> for the PR to finish this module!  Excellent job!

REQUIREMENTS
------------

Javascript enabled on your website and modern browsers which support the HTML5 multiple upload feature.
This module is not guaranteed to work in every browser, but will not break in older browsers.

INSTALLATION
------------

Install this module using the official Backdrop CMS instructions at https://backdropcms.org/guide/modules
This module requires no other libraries or special server configuration.

COMING FROM DRUPAL?
-------------------

nothing substantially changed.

PERMISSIONS
------------

yes, this module installs permissions for your roles to use

USAGE
-----

- Install the module like any other module.

- Set permission Upload via File Resumable Upload.

- Edit a File or Image field.

- Expand Resumable upload settings.

- Check Enable resumable upload.

- Set Maximum upload size, if needed.

- Check Start upload on files added, if desired.

- Save settings.

- Enjoy!

- Gracefully integrates with the core File and Image field widgets.

- Allows to upload multiple files at once.

- Allows to upload large files (over 2 GB) even to 32bit servers and bypassing PHP's upload limits.

- Allows to resume interrupted uploads.

- Supports both Browse and Drag & drop.

- Supports adding or removing files on the fly while uploading.

- Secure

- Fast handling of large files (Read recommendations below)

- Easy installation: No dependencies (except File itself), no libraries!

- Uses a custom and very lightweight (4.9 KB) JavaScript called resup.js, inspired by Resumable.js but more optimized.

- Displays an estimation of the remaining upload time.

- Allows to automatically start upload on files added.

LICENSE
-------

This project is GPL v2 software. See the LICENSE.txt file in this directory for complete text.

CREDITS
-----------

This module is based on the File Resumable Upload module for Drupal, originally written by:

anrikun <https://www.drupal.org/u/anrikun>

Supporting organizations:
Absyx Development <https://www.drupal.org/node/1765114>

MAINTAINERS
-----------

- seeking

Ported to Backdrop by:

- biolithic <https://github.com/biolithic>

