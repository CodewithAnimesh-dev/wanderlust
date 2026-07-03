const themeToggle = document.getElementById("themeToggle");

if(themeToggle){

    if(localStorage.getItem("theme") === "dark"){
        document.body.classList.add("dark-mode");
        themeToggle.innerHTML =
        '<i class="fa-solid fa-sun"></i>';
    }

    themeToggle.addEventListener("click",()=>{

        document.body.classList.toggle("dark-mode");

        if(document.body.classList.contains("dark-mode")){

            localStorage.setItem("theme","dark");

            themeToggle.innerHTML =
            '<i class="fa-solid fa-sun"></i>';

        }else{

            localStorage.setItem("theme","light");

            themeToggle.innerHTML =
            '<i class="fa-solid fa-moon"></i>';
        }

    });

}