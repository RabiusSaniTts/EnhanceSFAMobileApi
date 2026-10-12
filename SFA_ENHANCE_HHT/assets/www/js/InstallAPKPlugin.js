InstallAPKPlugin.prototype.installAPK = function (filePath) {
    cordova.exec(
        eventCallback,
        errorCallback,
        ANDROID_TAG,
        'INSTALL_APK',
        [filePath]
    );
};

// Example usage
function downloadAndInstallAPK(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function () {
        if (xhr.status === 200) {
            var blob = xhr.response;
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'your_app.apk';
            link.click();

            // Assuming the file is saved in the Downloads directory
            var filePath = '/storage/emulated/0/Download/your_app.apk';
            window.plugins.InstallAPKPlugin.installAPK(filePath);
        }
    };
    xhr.send();
}