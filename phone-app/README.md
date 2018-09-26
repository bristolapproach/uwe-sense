# UWE Sense Phone App
Phone application for the UWE Sense project.

## Prerequisites
- NodeJS and NPM
- NativeScript
- (Optional - Required for Android) Android SDK
- (Optional - Required for iOS) iOS SDK and an Apple PC / MacBook

## Installation
### Android
#### Compile

`tns build android`

#### Run

`tns run android`

### iOS
In order to contribute to this project on iOS, you must be enrolled as a
developer for KWMC at `developer.apple.com`, have a MacBook with MacOS and Xcode
installed. Once enrolled, go to `developer.apple.com` and click
`Certificates, Identifiers & Profiles`. Click on `Certificates - Production`,
then download both the `iOS distribution` and `Apple Push Services`
certificates. Import both of these certificates to your keyring. Open Xcode, and
on the top left dropdown click `Xcode -> Xcode Server -> Accounts -> +` and add
your account.

#### Project Preparation

To prepare the project for development:
`tns prepare ios`

To prepare the project for distribution:
`tns prepare ios --release`

Once prepared, the project may now be opened in Xcode at:
`phone-app/platforms/ios/phoneapp.xcworkspace`

On the left hand side of Xcode, click the sources icon
`Show the project navigator`, then click `phoneapp`. The main window should
show the projects general settings. Under these general settings, find the Team
dropdown and select `Knowle West Media Centre`.

#### Developing

Ensure an iOS device is plugged in via USB and has granted the Mac access to
make changes.

Ensure the iOS device is selected from within Xcode, as seen on the dropdown
menu to the right of the Play/Stop buttons.

Click the Play button. This will now build the app (which takes about 5 minutes)
and install it to the device (another 5 minutes). Once complete, you should be
able to experiment with the app.

Any changes made to source code, you'll need to retrace all your steps from
`Project Preparation` back to here. It's an annoying and lengthly process, I
know. `tns run ios` is a better solution, though all my attempts with this have
failed.

#### Distribution

You must be granted privileges in the KWMC Apple App Store Connect portal before
attempting to create an app version release.

Follow the `Project Preparation` guide.

Ensure the iOS device selected in Xcode is `Generic iOS Device` , as seen on the
dropdown menu to the right of the Play/Stop buttons.

Bump the version/build numbers to whatever the next release should be.

Select the `Capabilities` tab in Xcode, scroll to the bottom of the main pane
and toggle `Push notifications` to `ON`.

On the system bar, click `Product -> Archive` and wait for 5 minutes for it to
archive. Once complete (assuming no errors) a menu should come up with a button
on the right that lets you upload the archive. Click it. Then keep clicking next
until it starts uploading.

Wait another 3-12 hours and the App may either be ready or fail on Apples
CI server. An email will be sent to you, giving further details.

If successful, you may now begin testing the app on TestFlight.
