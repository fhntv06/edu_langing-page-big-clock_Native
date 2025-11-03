Data = new Date();
Hour = Data.getHours();
Minutes = Data.getMinutes();
Seconds = Data.getSeconds();

const arrowMimg = document.querySelector(".arrow-m-img");
const arrowHimg = document.querySelector(".arrow-h-img");
const arrowSimg = document.querySelector(".arrow-s-img");

const yourTime = document.querySelector(".your-time");
const Other = document.querySelector(".other");

const Button = document.querySelector(".btn");

let degH1 = -45 + ((Hour - 12) * 30); //в градусах
let degM1 = -45 + (Minutes * 6);
let degS1 = -45 + (Seconds * 6);
var i = 0;

function RotateS(){
	degS2 = degS1 + 6;
	txt = 'transform: rotate(' + degS2 + 'deg); ';
	arrowSimg.style.cssText = txt;
	degS1 = degS2;
}

function RotateM(){
	degM2 = degM1 + 0.1;
	txt1 = 'transform: rotate(' + degM2 + 'deg); ';
	arrowMimg.style.cssText = txt1;
	i++;
	degM1 = degM2;
}

function RotateH(){
	degH2 = degH1 + 0.0069444445;
	txt = 'transform: rotate(' + degH2 + 'deg); ';
	arrowHimg.style.cssText = txt;
	degH1 = degH2;
}

Button.addEventListener("click", function(){
	setInterval(RotateS, 1000);
	setInterval(RotateM, 1000);
	setInterval(RotateH, 1000);
	yourTime.style.display = "block";
	Other.style.display = "flex";
	Button.style.backgroudColor = "red";

	Button.classList.add("btn-active");
	Button.classList.remove("btn");

	Button.innerHTML = "Время пришло"
});

