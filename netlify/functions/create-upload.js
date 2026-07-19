/*
=========================================
Digitālā Vienreizlietojamā Kamera

Dropbox Upload Session Creator

Kāzas 08.10.2026
=========================================
*/


exports.handler = async function(event){


    if(event.httpMethod !== "POST"){


        return {

            statusCode:405,

            body:"Method not allowed"

        };

    }



    try{


        const body =
            JSON.parse(
                event.body
            );



        const filename =
            body.filename;



        if(!filename){


            throw new Error(
                "Nav faila nosaukuma"
            );


        }

        const duration =
            body.duration || 0;


        if(duration > 300){

            throw new Error(
                "Video garums pārsniedz 5 minūtes"
    );

}



        const token =
            await getDropboxAccessToken();






        const response =
            await fetch(

            "https://content.dropboxapi.com/2/files/upload_session/start",

            {


                method:"POST",


                headers:{


                    "Authorization":
                    `Bearer ${token}`,


                    "Content-Type":
                    "application/octet-stream"


                },


                body:""


            }


        );





        const data =
            await response.json();






        if(!data.session_id){


            throw new Error(
                "Neizdevās izveidot Dropbox session"
            );


        }







        return {


            statusCode:200,


            body:JSON.stringify({

                session_id:
                data.session_id,


                filename,


                access_token:
                token


            })


        };



    }

    catch(error){


        console.error(error);



        return {


            statusCode:500,


            body:JSON.stringify({

                error:
                error.message


            })


        };


    }


};









async function getDropboxAccessToken(){



const response =
await fetch(

"https://api.dropboxapi.com/oauth2/token",

{


method:"POST",


headers:{


"Content-Type":
"application/x-www-form-urlencoded"


},


body:
new URLSearchParams({


refresh_token:
process.env.DROPBOX_REFRESH_TOKEN,


grant_type:
"refresh_token",


client_id:
process.env.DROPBOX_APP_KEY,


client_secret:
process.env.DROPBOX_APP_SECRET


})


}

);





const data =
await response.json();



if(!data.access_token){


throw new Error(
"Dropbox token kļūda"
);


}



return data.access_token;


}