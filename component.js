AFRAME.registerComponent("switch-camera", {
  init: function () {
    this.handleError = this.handleError.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.getDevices = this.getDevices.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.devices = [];

    let _selectedCamera;
    Object.defineProperty(this, "selectedCamera", {
      get: () => _selectedCamera,
      set: (val) => {
        _selectedCamera = val;
        var event = new CustomEvent(
          "camera-switched",
          {
            detail: {
              selected: this.selectedCamera,
            }
          }
        )
        window.dispatchEvent(event);
      },
    });

    navigator.mediaDevices
      .enumerateDevices()
      .then(this.getDevices)
      .catch(this.handleError);

  },
  getDevices: function (deviceInfos) {
    for (var i = 0; i !== deviceInfos.length; ++i) {
      var deviceInfo = deviceInfos[i];
      if (deviceInfo.kind === "videoinput") {
        var id = deviceInfo.deviceId;
        if (!this.devices.includes(id)) {
          this.devices.push(id);
        }
      }
    }
    if (this.devices.length > 1) {
      this.createBtn();
      this.selectedCamera = "env"
    }
    // NOTE: if there is only one camera, it's probably a laptop, which usually
    //       only have a single front-facing camera (the webcam). In this case,
    //       the correct camera "user" since it is facing the user.
    else
      this.selectedCamera = "user"
  },
  handleClick: function (e) {
    var constraints;

    if (this.selectedCamera === "env") {
      constraints = {
        audio: false,
        video: {
          facingMode: "user",
          width: {
            ideal: 640,
          },
          height: {
            ideal: 480,
          },
        },
      };
      this.selectedCamera = "user";
    } else {
      constraints = {
        audio: false,
        video: {
          facingMode: "environment",
          width: {
            ideal: 640,
          },
          height: {
            ideal: 480,
          },
        },
      };
      this.selectedCamera = "env";
    }
    console.log("Contraints selected. Attempting to change camera...");

    var domElement = document.querySelector("#arjs-video");

    var oldStream = domElement.srcObject;
    oldStream.getTracks().forEach(function (track) {
      track.stop();
      console.log("Current stream stopped");
    });

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        domElement.srcObject = stream;

        document.body.addEventListener("click", function () {
          domElement.play();
        });
      })
      .catch(this.handleError);
  },
  handleError: function (error) {
    console.log("Something went wrong: ", error.message, error.name);
  },
  createBtn: function () {
    var selectCameraButton = document.createElement("button");
    selectCameraButton.setAttribute("id", "selectCameraButton");
    selectCameraButton.innerText = "↻";
    const containerElement = document.getElementById("buttonContainer");
    containerElement.appendChild(selectCameraButton);

    selectCameraButton.addEventListener("click", this.handleClick);
  },
});

