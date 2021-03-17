//code for creating a new electrical component on the screen.
/* Example Schema of an arduino with only the D0 pin registered
var arduino = {
    "component": {
        "imageURL": "image.png",
        "pins": {
            "D0": {
                "width": 17,
                "height": 18,
                "x": 884,
                "y": 25
            }
        }
    }
};
*/

//canvas is the canvas object that you wish to operate on
//schema is a JSON object that details the layout of the component you are creating. here we will use the arduino variable as a test
var createComponent = function(canvas, schema){
    //initialize group for component, this is the object that will be returned to the canvas (and later will maintain the components electrical properties)
    var component_group;
    //initialize component image, this is what will appear on screen
    var component_img;
    var image_loaded = false; //image loading is done async, so we maintain it's state using a variable
    fabric.Image.fromURL(schema.component.imageURL, function(import_image){
        //callback function for whenever image finally loads
        component_img = import_image;
        image_loaded= true;
    });

    var pins = [];
    for(pin in schema.component.pins){
        currPin = schema.component.pins[pin];
        var pinToAdd = new fabric.Rect({
            fill: 'red',
            width: currPin.width,
            height: currPin.height,
            top: currPin.y,
            left: currPin.x,
            opacity: 0 //set to 1 for testing, once the hover code is working set this to 0
        });
        pins.push(pinToAdd);
    }
    var mouseMove = function(option){
        if(option && option.subTargets[0] && (option.subTargets[0].type == 'rect')){
            //compare subtarget (pin that the mouse is pointed at) to the target (group) object list top, left, width and height values and then use that
            //  index for the component_groups objects
            //this will allow you to specify which pin to make opaque
            //okay this is going to be tougher code than I expected but we can do it. Referencing and dereferencing HAVE FUN KIERAN
            //console.log(option.subTargets[0]); //just to print out relevant information of the current object we're hovering over (as long as its a rect)
            var match;
            for(idx in option.subTargets[0].group._objects){
                checkTarget = option.subTargets[0].group._objects[idx];
                //console.log(checkTarget)
                if( option.subTargets[0].top == checkTarget.top && 
                    option.subTargets[0].left == checkTarget.left && 
                    option.subTargets[0].width == checkTarget.width && 
                    option.subTargets[0].height == checkTarget.height){
                        component_group.getObjects()[idx].set('opacity', 1);
                }
            }
        }
        else{
            for(item in component_group.getObjects()){
                if(item>0)
                    component_group.getObjects()[item].set('opacity', 0);
            }
        }
        canvas.requestRenderAll();
    };
    var createGroup = function(){
        if(!image_loaded){
            setTimeout(function() { createGroup() }, 100); //if the image hasn't loaded yet, wait 100 millis and try again
            return;
        }
        component_group = new fabric.Group([component_img].concat(pins), {
            subTargetCheck : true,
            hoverCursor: 'pointer'
        });
        component_group.on('mouseover', function(option){
            canvas.on('mouse:move', mouseMove);
        });
        component_group.on('mouseout', function(option){
            mouseMove();
            canvas.off('mouse:move', mouseMove);
        })
        canvas.add(component_group.scale(0.5));
    }
    createGroup();
    return component_group;
}
