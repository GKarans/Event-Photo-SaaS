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



const guestWelcomeName =
    document.getElementById("guestWelcomeName");


const changeGuestButton =
    document.getElementById("changeGuestButton");


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
// Video drošības limiti
// =================================


// Viesim rādām ieteikumu:
// līdz 3 minūtēm

const WARNING_VIDEO_DURATION =
    180;



// Maksimāli atļauts:
// 5 minūtes

const MAX_VIDEO_DURATION =
    300;



// Maksimālais faila izmērs:
// 800 MB

const MAX_VIDEO_SIZE =
    800 * 1024 * 1024;







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
// Kameras režīms
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


    if(guestWelcomeName){

        guestWelcomeName.textContent =
            guestName;

    }


}



function showGuestSection(){



    cameraSection.classList.add(
        "hidden"
    );


    guestSection.classList.remove(
        "hidden"
    );


    guestInput.value =
        "";


    guestInput.focus();


    hideMessages();


}











// =================================
// Kameras pogas
// =================================



changeGuestButton.addEventListener(
    "click",
    () => {


        localStorage.removeItem(
            "guestName"
        );


        guestName =
            "";


        showGuestSection();


    }
);



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


            checkVideo(
                videoInput.files[0]
            );


        }


    }
);











// =================================
// Video pārbaude
// =================================


function checkVideo(file){



    if(file.size > MAX_VIDEO_SIZE){


        showError(
            "Video ir pārāk liels. Lūdzu ieraksti īsāku video ❤️"
        );


        resetCamera();


        return;


    }



    uploadFile(
        file,
        "mp4"
    );


}
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








        // =========================
        // FOTO
        // =========================


        if(type === "jpg"){



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





            const response =
                await fetch(
                    "/.netlify/functions/upload",
                    {

                        method:"POST",

                        body:formData

                    }
                );






            if(!response.ok){


                throw new Error(
                    "Foto augšupielāde neizdevās"
                );


            }



        }







        // =========================
        // VIDEO
        // =========================


        if(type === "mp4"){



            await uploadVideoDirect(
                file,
                fileName
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



        console.error(
            error
        );



        loading.classList.add(
            "hidden"
        );



        showError(
            error.message || "Neizdevās nosūtīt kadru. Mēģini vēlreiz ❤️"
        );



        resetCamera();



    }


}









// =================================
// Tiešais video upload uz Dropbox
// =================================


// =================================
// Dropbox video upload ar gabaliem
// =================================


async function uploadVideoDirect(
    file,
    filename
){



    const CHUNK_SIZE =
        8 * 1024 * 1024; // 8MB





    // ===============================
    // 1. Izveido upload session
    // ===============================



    const createResponse =
        await fetch(
            "/.netlify/functions/create-upload",
            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },


                body:
                JSON.stringify({

                    filename

                })


            }
        );



    if(!createResponse.ok){

        const errorText =
            await createResponse.text();

        throw new Error(
            errorText || "Dropbox session kļūda"
        );

    }



    let session;

    try{

        session =
            await createResponse.json();

    }

    catch{

        throw new Error(
            "Dropbox session atbilde nav derīga"
        );

    }



    if(!session.session_id ||
       !session.access_token){


        throw new Error(
            session.error || "Dropbox session kļūda"
        );


    }









    let offset = 0;





    // ===============================
    // 2. Sūta gabalus
    // ===============================


    while(offset < file.size){



        const chunk =
            file.slice(
                offset,
                offset + CHUNK_SIZE
            );





        const isLast =
            offset + CHUNK_SIZE >= file.size;







        if(isLast){



            // ==========================
            // FINISH
            // ==========================


            const response =
                await fetch(

"https://content.dropboxapi.com/2/files/upload_session/finish",

                {


                    method:"POST",


                    headers:{


                        "Authorization":
                        `Bearer ${session.access_token}`,



                        "Content-Type":
                        "application/octet-stream",



                        "Dropbox-API-Arg":
                        JSON.stringify({

                            cursor:{


                                session_id:
                                session.session_id,


                                offset:
                                offset


                            },


                            commit:{


                                path:
                                `/WeddingCamera/Videos/${filename}`,


                                mode:
                                "add",


                                autorename:
                                true


                            }


                        })


                    },


                    body:
                    chunk


                }


            );





            if(!response.ok){


                throw new Error(
                    "Dropbox finish kļūda"
                );


            }




        }

        else {



            // ==========================
            // APPEND
            // ==========================


            const response =
                await fetch(

"https://content.dropboxapi.com/2/files/upload_session/append_v2",

                {


                    method:"POST",


                    headers:{


                        "Authorization":
                        `Bearer ${session.access_token}`,



                        "Content-Type":
                        "application/octet-stream",



                        "Dropbox-API-Arg":
                        JSON.stringify({

                            cursor:{


                                session_id:
                                session.session_id,


                                offset:
                                offset


                            }


                        })


                    },


                    body:
                    chunk


                }


            );





            if(!response.ok){


                throw new Error(
                    "Dropbox chunk upload kļūda"
                );


            }



        }







        offset +=
            chunk.size;






        // ==========================
        // Progress
        // ==========================


        const percent =
            Math.round(
                (offset / file.size) * 100
            );



        loading.textContent =
            `Augšupielāde ${percent}%`;



    }



}








// =================================
// Atgriezties kamerā
// =================================


function resetCamera(){



    photoInput.value =
        "";



    videoInput.value =
        "";



}











// =================================
// Datums faila vārdam
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
// Drošs faila vārds
// =================================


function cleanName(name){



    const baseName =
        String(name || "guest")
            .trim();


    if(!baseName){

        return "guest";

    }


    const normalized =
        baseName
            .normalize(
                "NFKD"
            )
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );


    return normalized
        .replace(
            /[^a-zA-Z0-9]+/g,
            "_"
        )
        .replace(
            /^_+|_+$/g,
            ""
        )
        .replace(
            /_+/g,
            "_"
        );



}











// =================================
// Kļūdas
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
        ()=>{


            errorBox.classList.add(
                "hidden"
            );


        },
        4000
    );



}











// =================================
// Ziņojumu tīrīšana
// =================================


function hideMessages(){



    errorBox.classList.add(
        "hidden"
    );



    success.classList.add(
        "hidden"
    );


}

