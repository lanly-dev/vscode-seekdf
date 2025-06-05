# Change Log

All notable changes to the "seekdf" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.4] - 2025-06-05
- Change color value to hex for banner
- 9 files, 50.19 KB, 1.100.0

### Notes:
- Using value `black` instead of hex for banner color is not supported. For vscode marketplace, the black color won't render if select some sub-tabs in the page. For open-vsx, it was fine at 1st, but crashed the page after couple days 🤔 -
  > MUI: Unsupported `black` color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().`

## [1.0.3] - 2025-05-25
- Just update configs and dependencies
- Publish to [open-vsx](https://open-vsx.org/)
- 9 files, 49.88KB, 1.100.0

### Notes
- Powershell may block the build scripts due to cert issue
- Need to set `moduleResolution` in **tsconfig.json** to resolve the *pretty-byte* import

### References
- https://github.com/EclipseFdn/open-vsx.org/wiki/Publishing-Extensions#publishing-with-the-ovsx-command
- https://open-vsx.org/extension/lanly-dev/seekdf


## [1.0.2] - 2025-01-13
- Only minor logo changes \
  <img src='https://github.com/lanly-dev/vscode-seekdf/blob/main/media/vscodeignore/seekdf.png?raw=true' width='50'/>
  <img src='https://github.com/lanly-dev/vscode-seekdf/blob/main/media/seekdf.png?raw=true' width='50'/>
- 9 files, 49.57KB, 1.96.0


## [1.0.0, 1.0.1] - 2025-01-11
- Initial release
- 9 files, 42.86KB, 1.96.0
