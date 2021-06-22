$(document).ready(function(){

    if(localStorage.getItem("cookies") == null || localStorage.getItem("cookies") == "declined"){
        $("#cookieBlock").show();
    }

    $("#acceptCookies").click(function(){
        $("#cookieBlock").hide();
        localStorage.setItem("cookies", "accepted");
    });

    $("#declineCookies").click(function(){
        localStorage.setItem("cookies", "declined");
        $("#cookieAlert h1").text("Well, come back when you change your mind");
    });

    $("#reset").click(function(){
        location.reload();
        localStorage.clear();
    });

    let currentImages = [];
    let currentImageIndex = -1;
    let arrLength = 0;

    function moveRight(){
        arrLength = currentImages.length;
        if(currentImageIndex < arrLength - 1){
            currentImageIndex++;
            $("#carouselImageHolder img").animate({left: '-100%'});
            setTimeout(function(){
                $("#carouselImageHolder img").animate({left: '100%'});
                $("#carouselImageHolder img").hide();
                $("#carouselImageHolder").html(`<img src="assets/images/${currentImages[currentImageIndex].src}" alt=""/>`);
                $("#carouselImageHolder img").css("left", "100%");
                $("#carouselImageHolder img").animate({left: '0%'});
            }, 400);
        }
    }

    function moveLeft(){
        if(currentImageIndex > 0){
            currentImageIndex--;
            $("#carouselImageHolder img").animate({left: '100%'});
            setTimeout(function(){
                $("#carouselImageHolder img").animate({left: '-100%'});
                $("#carouselImageHolder img").hide();
                $("#carouselImageHolder").html(`<img src="assets/images/${currentImages[currentImageIndex].src}" alt=""/>`);
                $("#carouselImageHolder img").css("left", "-100%");
                $("#carouselImageHolder img").animate({left: '0%'});
            }, 400);
        }
    }

    function dragAndDrop(){
        const imageFrames = document.querySelectorAll(".imageFrame");

        for(const imageFrame of imageFrames){
            imageFrame.addEventListener("dragstart", function(){
                dragged = $(this).attr('data-id');
            });
            imageFrame.addEventListener("dragend", function(){
                let first = null;
                let second = null;
                let firstIndex;
                let secondIndex;
                for(let i = 0; i < currentImages.length; i++){
                    if(currentImages[i].id == dragged){
                        first = currentImages[i];
                        firstIndex = i;
                    }
                    if(currentImages[i].id == lastEntered){
                        second = currentImages[i];
                        secondIndex = i;
                    }
                }
                currentImages[firstIndex] = second;
                currentImages[secondIndex] = first;
                localStorage.setItem("currentImages", JSON.stringify(currentImages));
                getFromLocalStorage();
            });
            imageFrame.addEventListener("dragenter", function(){
                lastEntered = $(this).attr('data-id');
            });
        }
    }

    function frameListener(){
        $(".imageFrame").click(function(){
            currentImageIndex = -1;
            $("#carousel").show();
            $("#carousel").css("display", "flex");
            for(let x of currentImages){
                currentImageIndex++;
                if(x.id == $(this).attr('data-id')){
                    $("#carouselImageHolder").html(`<img src="assets/images/${x.src}" alt=""/>`);
                    $("#carouselClose").click(function(){
                        $("#carousel").hide();
                    });
                    break;
                }
            }
        });
    }

    function getFromLocalStorage(){
        currentImages = [];
        let output = "";
        for(let x of JSON.parse(localStorage.currentImages)){
            currentImages.push(x);
            output += `<div draggable="true" class="imageFrame" data-id=${x.id}><img draggable="false" src="assets/images/${x.src}" alt=""></div>`;
        }
        $("#newGrid").html(output);
        dragAndDrop();
        frameListener();
    }

    $('.arrow').click(function(){
        arrLength = currentImages.length;
        if($(this).attr("data-direction") == "right"){     
            moveRight();
        }else {
            moveLeft();
        }
    });

    function compareStrings(title, description, searchTerm){
        let term = searchTerm.toLowerCase();
        if(title.toLowerCase().search(term) != -1 || description.toLowerCase().search(term) != -1){
            return true;
        }else {
            return false;
        }
    }

    function fillGrid(searchTerm) {
        currentImages = [];
        $.ajax({
            url: 'data/images.json',
            method: 'GET',
            dataType: 'json',
            success: function(response){
                for(let x of response){
                    console.log("loop");
                    if(searchTerm == ""){
                        currentImages.push(x);
                    }else {
                        if(compareStrings(x.title, x.description, searchTerm)){
                            currentImages.push(x);
                        }
                    }
                }
                console.log(currentImages);
                localStorage.setItem("currentImages", JSON.stringify(currentImages));
                getFromLocalStorage();
            },
            error: function(jqXHR){
                console.log(jqXHR);
            }
        });
        arrLength = currentImages.length;
    }

    let timeout = null;
    let dragged = null;
    let lastEntered = null;

    if(localStorage.currentImages != null){
        getFromLocalStorage();
    }else {
        fillGrid("");
    }

    $("#searchBar").keyup(function(){
        clearTimeout(timeout);
        timeout = setTimeout(function(){
            fillGrid($("#searchBar").val());
        }, 400);
    });

    let interval;
    arrLength = currentImages.length;

    function play(){
        let intervalCount = currentImageIndex;
        interval = setInterval(slide, 1000);
        function slide() {
            if(intervalCount < arrLength){
                moveRight();
                intervalCount++;
            }else {
                pause();
            }
        }
    }

    function pause(){
        clearInterval(interval);
    }

    $("#play").click(function(){
        moveRight();
        play();
    });

    $("#pause").click(function(){
        pause();
    });

});

