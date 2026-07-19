/*
=========================================
Digitālā Vienreizlietojamā Kamera
Kāzas 08.10.2026

Client-side JavaScript
=========================================
*/


// Elementi

const guestSection = document.getElementById("guest-section");
const cameraSection = document.getElementById("camera-section");

const guestInput = document.getElementById("guestName");
const startButton = document.getElementById("startButton");

const guestDisplay = document.getElementById("guestDisplay");

const photoButton = document.getElementById("photoButton");
const videoButton = document.getElementById("videoButton");

const photoInput = document.getElementById("photoInput");
const videoInput = document.getElementById("videoInput");

const loading = document.getElementById("loading");
const success = document.getElementById("success");
const errorBox = document.getElementById("error");



let guestName = "";





// =================================
// Palaižot lapu
// =================================

window.addEventListener(
    "load",
    () => {


        const savedName =
            localStorage.getItem("guestName");


        if(savedName){

            guestName = savedName;

            showCameraMode();

        }


    }
);







// =================================
// Sākt fotografēšanu
// =================================

startButton.addEventListener(
    "click",
    () => {


        const name =
            guestInput.value.trim();



        if(!name){

            showError(
                "Lūdzu ievadi savu vārdu ❤️"
            );

            return;

        }



        guestName = name;


        localStorage.setItem(
            "guestName",
            guestName
        );



        showCameraMode();


    }
);







function showCameraMode(){


    guestSection.classList.add(
        "hidden"
    );


    cameraSection.classList.remove(
        "hidden"
    );


    guestDisplay.textContent =
        guestName;


}









// =================================
// Kameras pogas
// =================================


photoButton.addEventListener(
    "click",
    ()=>{


        photoInput.click();


    }
);





videoButton.addEventListener(
    "click",
    ()=>{


        videoInput.click();


    }
);








// =================================
// Kad foto/video gatavs
// =================================


photoInput.addEventListener(
    "change",
    ()=>{


        if(photoInput.files.length){

            uploadFile(
                photoInput.files[0],
                "jpg"
            );

        }


    }
);





videoInput.addEventListener(
    "change",
    ()=>{


        if(videoInput.files.length){


            uploadFile(
                videoInput.files[0],
                "mp4"
            );


        }


    }
);










// =================================
// Augšupielāde
// =================================


async function uploadFile(
    file,
    type
){


    hideMessages();


    loading.classList.remove(
        "hidden"
    );



    try {


        const timestamp =
            createTimestamp();



        const extension =
            type;



        const fileName =
            `${cleanName(guestName)}_${timestamp}.${extension}`;




        const formData =
            new FormData();



        formData.append(
            "file",
            file
        );



        formData.append(
            "filename",
            fileName
        );




        /*
        Šis URL vēlāk tiks savienots
        ar Netlify Function

        /api/upload
        */


        const response =
            await fetch(
                "/api/upload",
                {
                    method:"POST",
                    body:formData
                }
            );




        if(!response.ok){

            throw new Error(
                "Augšupielāde neizdevās"
            );

        }




        loading.classList.add(
            "hidden"
        );



        success.classList.remove(
            "hidden"
        );




        setTimeout(
            ()=>{


                success.classList.add(
                    "hidden"
                );


                resetCamera();


            },
            2000
        );



    }

    catch(error){


        loading.classList.add(
            "hidden"
        );


        showError(
            error.message
        );


        resetCamera();


    }



}










// =================================
// Atgriezties fotografēšanā
// =================================


function resetCamera(){


    photoInput.value="";
    videoInput.value="";


    cameraSection.classList.remove(
        "hidden"
    );


}









// =================================
// Datuma/laika formāts
// =================================


function createTimestamp(){


    const now =
        new Date();



    const y =
        now.getFullYear();



    const m =
        String(
            now.getMonth()+1
        ).padStart(2,"0");



    const d =
        String(
            now.getDate()
        ).padStart(2,"0");



    const h =
        String(
            now.getHours()
        ).padStart(2,"0");



    const min =
        String(
            now.getMinutes()
        ).padStart(2,"0");



    const s =
        String(
            now.getSeconds()
        ).padStart(2,"0");



    return `${y}-${m}-${d}_${h}-${min}-${s}`;

}







// =================================
// Drošs faila vārds
// =================================


function cleanName(name){


    return name
        .replace(
            /[^a-zA-Z0-9Ā-ž]/g,
            "_"
        );


}







// =================================
// Kļūdas
// =================================


function showError(message){


    errorBox.textContent =
        message;


    errorBox.classList.remove(
        "hidden"
    );


    setTimeout(
        ()=>{
            errorBox.classList.add(
                "hidden"
            );
        },
        4000
    );


}



function hideMessages(){

    errorBox.classList.add(
        "hidden"
    );


    success.classList.add(
        "hidden"
    );

}