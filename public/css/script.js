var slides=['https://t3.ftcdn.net/jpg/04/68/47/46/360_F_468474640_YcXTQsmw1U2sqnFG8vZyTq8SyoYsbvva.jpg','http://www.fuelfornation.com/assets/img/home/banner/banner.jpg','https://www.narayanseva.org/wp-content/uploads/2021/12/achievement-banner-1.jpg'];

var Start=0;

function slider(){
    if(Start<slides.length){
        Start=Start+1;
    }
    else{
        Start=1;
    }
    console.log(img);
    // img.innerHTML = "<img  src="+slides[Start-1]+">";
    document.querySelector("#img").setAttribute("src",slides[Start-1]);
   
}
setInterval(slider,3000);