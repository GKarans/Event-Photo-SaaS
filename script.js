/*
=========================================
Digitālā Vienreizlietojamā Kamera
Kāzas 08.10.2026

Client-side JavaScript

1. daļa
=========================================
*/


// =================================
// Elementi
// =================================

const guestSection =
    document.getElementById("guest-section");

const cameraSection =
    document.getElementById("camera-section");


const guestInput =
    document.getElementById("guestName");


const startButton =
    document.getElementById("startButton");


const guestDisplay =
    document.getElementById("guestDisplay");


const photoButton =
    document.getElementById("photoButton");


const videoButton =
    document.getElementById("videoButton");


const photoInput =
    document.getElementById("photoInput");


const videoInput =
    document.getElementById("videoInput");


const loading =
    document.getElementById("loading");


const success =
    document.getElementById("success");


const errorBox =
    document.getElementById("error");





// =================================
// Globālie mainīgie
// =================================

let guestName = "";





// =================================
// Ielādējot lapu
// =================================

window.addEventListener(
    "load",
    () => {


        const savedName =
            localStorage.getItem(
                "guestName"
            );


        if(savedName){


            guestName =
                savedName;


            showCameraMode();


        }


    }
);








// =================================
// Viesa sākšana
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



        guestName =
            name;



        localStorage.setItem(
            "guestName",
            guestName
        );



        showCameraMode();



    }
);







// =================================
// Parādīt kameru
// =================================

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
    () => {


        photoInput.click();


    }
);





videoButton.addEventListener(
    "click",
    () => {


        videoInput.click();


    }
);









// =================================
// Foto izvēlēts
// =================================

photoInput.addEventListener(
    "change",
    () => {


        if(photoInput.files.length){


            uploadFile(
                photoInput.files[0],
                "jpg"
            );


        }


    }
);







// =================================
// Video izvēlēts
// =================================

videoInput.addEventListener(
    "change",
    () => {


        if(videoInput.files.length){


            uploadFile(
                videoInput.files[0],
                "mp4"
            );


        }


    }
);









// =================================
// Upload funkcija
// (turpinājums 2. daļā)
// =================================

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



        const fileName =
            `${cleanName(guestName)}_${timestamp}.${type}`;





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
        FOTO:
        /.netlify/functions/upload

        VIDEO:
        /.netlify/functions/video-upload
        */


        let uploadEndpoint;



        if(type === "mp4"){


            uploadEndpoint =
                "/.netlify/functions/video-upload";


        }
        else{


            uploadEndpoint =
                "/.netlify/functions/upload";


        }







        const response =
            await fetch(
                uploadEndpoint,
                {

                    method:"POST",

                    body:formData

                }
            );






        if(!response.ok){


            const errorText =
                await response.text();


            throw new Error(
                errorText ||
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
            () => {


                success.classList.add(
                    "hidden"
                );


                resetCamera();


            },
            2000
        );



    }



    catch(error){



        console.error(
            error
        );



        loading.classList.add(
            "hidden"
        );



        showError(
            "Neizdevās nosūtīt kadru. Mēģini vēlreiz."
        );



        resetCamera();



    }



}










// =================================
// Atgriezties kameras režīmā
// =================================

function resetCamera(){



    photoInput.value =
        "";


    videoInput.value =
        "";



}









// =================================
// Datums un laiks faila vārdam
// =================================

function createTimestamp(){



    const now =
        new Date();




    const y =
        now.getFullYear();



    const m =
        String(
            now.getMonth()+1
        )
        .padStart(
            2,
            "0"
        );



    const d =
        String(
            now.getDate()
        )
        .padStart(
            2,
            "0"
        );



    const h =
        String(
            now.getHours()
        )
        .padStart(
            2,
            "0"
        );



    const min =
        String(
            now.getMinutes()
        )
        .padStart(
            2,
            "0"
        );



    const s =
        String(
            now.getSeconds()
        )
        .padStart(
            2,
            "0"
        );



    return `${y}-${m}-${d}_${h}-${min}-${s}`;

}










// =================================
// Drošs vārds failam
// =================================

function cleanName(name){


    return name
        .replace(
            /[^a-zA-Z0-9Ā-ž]/g,
            "_"
        );


}









// =================================
// Kļūdu paziņojumi
// =================================

function showError(
    message
){



    errorBox.textContent =
        message;



    errorBox.classList.remove(
        "hidden"
    );



    setTimeout(
        () => {


            errorBox.classList.add(
                "hidden"
            );


        },
        4000
    );



}









// =================================
// Notīrīt ziņojumus
// =================================

function hideMessages(){


    errorBox.classList.add(
        "hidden"
    );


    success.classList.add(
        "hidden"
    );


}