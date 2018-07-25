const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore({
    projectId: 'find-dining-d29f5',
    keyFilename: './Find Dining-2f1d94f5e21c.json',
});

const fetch = require("node-fetch");
var parser = require('xml2json');


async function populate() {
    const uniqueMeals = new Set();
  //  const document = await firestore.collection('offerings');
    const mealDoc = await firestore.collection("meals");

    for (let i = 4; i <= 100; i++) {
        const url = `https://microsoft.sharepoint.com/sites/refweb/_api/web/lists/GetByTitle('DiningMenus')/items?$select=CafeName,StationName,DayOfWeekID,WeekDate,MenuItem,MenuDescription,MenuPrice&$filter=CafeName%20eq%20%27Cafe%20${i}%27%20and%20WeekDate%20ge%20datetime%272018-07-23T07:00:00.000Z%27%20and%20WeekDate%20le%20datetime%272018-07-24T06:59:59.059Z%27&$orderby=DayOfWeekID,StationName&$top=700`;
        const cafename = `Cafe ${i}`;
        let resp;
        try {
            resp = await fetch(url, {
                headers: {
                    cookie: 'SearchSession=6f13f001%2Dd77a%2D43f7%2D8b15%2Da0a2a3f9de6f; rtFa=80N8vfIlC40wfznkrPCYYW3ulSFR3Q5q7WNjxH4N6PYmRUM2M0IwOUItOTc0OC00N0JBLTkwMTgtQkVFQURENDA1MjA0TTskNI2S5t0Lh9UDocKL9f8lkp+yhwijsuAbI3xDVJkT8Ll1mNHR76dLNd8ipRoFnDM7i8SAU2Q8ZVot63VPABea3gpYNJtrNIy7t9RbFGiDjc2CrS37CgZd90QG8lM/H7hj0JfX3DW81DpH7Ko27UAg36YIkrkq2jeku0+xkCbK074Trxk+H6zI+nRtS17wXj/6skmjRqGjHEQjCdefHBnMTkX9ebHrbEx8Hp5sgRpljRO/zwAYNyJj1yUrWvawI05USXPsqltDzrtoeDBDIPeIJHx1rdi/MPNjWKmmjt/2hdtmnAMHqzQFaWApSTT3zcT6bg3rHasemBivAfDjDkUAAAA=; FedAuth=77u/PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48U1A+VjUsMGguZnxtZW1iZXJzaGlwfDEwMDMzZmZmYTNjNzUyZjRAbGl2ZS5jb20sMCMuZnxtZW1iZXJzaGlwfHNod3NoYUBtaWNyb3NvZnQuY29tLDEzMTc2ODQwODc4MDAwMDAwMCwxMzE3MTM5NjkzMTAwMDAwMDAsMTMxNzcyODk2NDIzMDAxNTA1LDAuMC4wLjAsNjcsZWM2M2IwOWItOTc0OC00N2JhLTkwMTgtYmVlYWRkNDA1MjA0LCxWMiExMDAzM0ZGRkEzQzc1MkY0ITEzMTc2ODQwODc4LDFiYjY3ZDllLWYwNDktMDAwMC05YjYxLWY4MzI4ZTlkMmNjMSwxYmI2N2Q5ZS1mMDQ5LTAwMDAtOWI2MS1mODMyOGU5ZDJjYzEsLDAsMTMxNzY4NjEyNDIxNzU1Nzc0LDEzMTc3MTE2ODQyMTc1NTc3NCwscU5FdWlSeThxdHZhc2R5cGpmOW9aY1AwaUF6MzZHeUFHaDNCeTNxZzFjNFBnNlVtWWtRcUFDc0psVjd2aWlCU1JjcnpSOFhjdG5saFN2VjRsQ3FrZFZZckUxWWYxN3pIcGJYcXFwQmhqQWhxTXUreXNoVnBKLzFxRDh4cVdCQ3RxVklYbkpCM1VuQUFmQWwzRkpVMVdhVjlJNXByU1gzOFlqT3djandiMjJrVWxZMVZQcVVpOSs2a1lkYXc2dFp2YUtLU09OMEJVN2NmTDlZSzZLN2FUS0dhMVFJZHRtUWxGbGszYUxFd2p3dzBMRkQzT3RlTkxKbk9SNld5VlRxZHJMdkl1elcxQmZHM2xqQjlkVVV2WGRENHFxaWZ0UnZjWXkzbmNrRTJxZklUbmJqQlV5ckNEZWZHUjEyNW8zVFhOV3dDbHVIbTJxM2VnT1gzT29uanBBPT08L1NQPg==; ai_user=h0Ugi|2018-07-23T22:14:05.827Z; WSS_FullScreenMode=false; odbn=1; ec63b09b974847ba9018beeadd405204c47526217f8f480484203449e6dbd0b7i%3A0%23%2Ef%7Cmembership%7Cshwsha%40microsoft%2Ecom=0; WT_FPC=id=0dc25663-214c-4398-8bec-dc907651d42c:lv=1532381267837:ss=1532380447300; ai_session=7MfoU|1532384046221|1532384911344.7'
                }
            });
        } catch (e) {
            continue;
        }

        const xml = await resp.text();
        const data = JSON.parse(parser.toJson(xml));
        if (!data.feed || !data.feed.entry) { continue; }
        data.feed.entry.forEach(async (entry) => {
            const meal = entry.content['m:properties']['d:MenuItem'];
            uniqueMeals.add(meal);
            const day = entry.content['m:properties']['d:DayOfWeekID']['$t'];

            try {
                const offering = {
                    cafename,
                    day,
                    meal
                };
                console.log("Offering" + offering.meal);
              //  await document.add(offering);

                const meals = {
                    meal
                }
                await mealDoc.add(meals);


            } catch(e) {
                console.log('FAIL', e);
            }
        });
    }

}

populate();

