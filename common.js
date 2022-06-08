var hamburger = document.querySelector(".hamburger");
hamburger.addEventListener("click", function() {
  document.querySelector("body").classList.toggle("active");
})

var loadFile = function(event) {
    var output = document.getElementById('tour_img_1');
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = function() {
      URL.revokeObjectURL(output.src) // free memory
    }
  };
  var loadFile = function(event) {
      var output = document.getElementById('package_img');
      output.src = URL.createObjectURL(event.target.files[0]);
      output.onload = function() {
        URL.revokeObjectURL(output.src) // free memory
      }
    };

var loadFile = function(event) {
    var output = document.getElementById('city_image');
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = function() {
      URL.revokeObjectURL(output.src) // free memory
    }
  };

  var loadFile = function(event) {
      var output = document.getElementById('tour_img_2');
      output.src = URL.createObjectURL(event.target.files[0]);
      output.onload = function() {
        URL.revokeObjectURL(output.src) // free memory
      }
    };
    var loadFile = function(event) {
        var output = document.getElementById('tour_img_3');
        output.src = URL.createObjectURL(event.target.files[0]);
        output.onload = function() {
          URL.revokeObjectURL(output.src) // free memory
        }
      };
