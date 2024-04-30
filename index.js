require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const https = require('https');

const agent = new https.Agent({  
  rejectUnauthorized: false
});

app.set('view engine', 'pug');
app.use('/scripts', express.static(__dirname + '/scripts'));
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next()
});

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

app.get('/', async (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '-1');

    getSkillsData()
    .then(resp => {
        if(resp) {
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '-1');
            res.render('skills', { title: 'Skills | HubSpot APIs', data: resp.skillsData });
        }
    })
    .catch(error => {
        console.error(error);
    });
});

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

app.get('/update-cobj-refresh', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '-1');
    res.redirect('/');
});

app.get('/update-cobj', async (req, res) => {
    try 
    { 
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '-1');

        getSkillsData()
        .then(resp => {
            if(resp) {
                res.set('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
                res.set('Pragma', 'no-cache');
                res.set('Expires', '-1');
                res.render('updates', { title: 'UpSert Skills | HubSpot APIs', data: {skillsData: resp.skillsData, propertiesData: resp.propertiesData} });
            }
        })
        .catch(error => {
            console.error(error);
        });
    } 
    catch(err) 
    {
        console.error(err);
        if (err.response) {
            console.log(err.response.data); console.log(err.response.status); console.log(err.response.headers);
            res.status(err.response.status).json({ error: err.response.data });
        } else if (err.request) {
            console.log(err.request);
            res.status(500).json({ error: 'No response from the server while loading the update route.' });
        } else {
            console.log('Error', err.message);
            res.status(500).json({ error: 'An error occurred while loading the update route.' });
        }
    }
});

// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

app.post('/update-cobj', async (req, res) => {
    const values = req.body;
    const operation = req.body.operation;

    const propertiesObject = {
        properties: {
            "technique": Array.isArray(values.technique) ? values.technique.join(';') : values.technique,
            "music_genre": Array.isArray(values.music_genre) ? values.music_genre.join(';') : values.music_genre,
            "complexity_level": values.complexity_level,
            "execution_level": values.execution_level,
            "name": values.name,
            "description": values.description
        }
    }

    const updateSkill = `https://api.hubapi.com/crm/v3/objects/skills/${values.id}`;
    const createSkill = `https://api.hubapi.com/crm/v3/objects/skills`;
    const headers = {
        Authorization: `Bearer ${process.env.PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try
    {
        if(operation){
            if(operation == 'update'){
                try 
                { 
                    await axios.patch(updateSkill, propertiesObject, { headers, httpsAgent: agent } )
                    .then(async (response) => {
                        res.send(
                            `
                            <button id="refreshButton" style="padding: 10px 20px; font-size: 16px;">Go to List Skills</button>
                            <script>
                                alert("Skill '${values.name}' updated with success! See your updated Skill in the Skill list."); 
                                document.getElementById('refreshButton').addEventListener('click', function() {
                                    window.location.assign('/update-cobj-refresh');
                                });
                            </script>
                            `
                        );
                    });
                } 
                catch(err) 
                {
                    console.error(err);
                    if (err.response) {
                        console.log(err.response.data); console.log(err.response.status); console.log(err.response.headers);
                        res.status(err.response.status).json({ error: err.response.data });
                    } else if (err.request) {
                        console.log(err.request);
                        res.status(500).json({ error: 'No response from the server while making the update request.' });
                    } else {
                        console.log('Error', err.message);
                        res.status(500).json({ error: 'An error occurred while making the update request.' });
                    }
                }
            }
            else if(operation == 'create'){
                try { 
                    await axios.post(createSkill, propertiesObject, { headers, httpsAgent: agent } )
                    .then(async (response) => {
                        res.send(
                            `
                            <button id="refreshButton" style="padding: 10px 20px; font-size: 16px;">Go to List Skills</button>
                            <script>
                                alert("Skill '${values.name}' created with success! See your new Skill in the Skill list."); 
                                document.getElementById('refreshButton').addEventListener('click', function() {
                                    window.location.assign('/update-cobj-refresh');
                                });
                            </script>
                            `
                        );
                    });
                } 
                catch(err) {
                    console.error(err);
                    if (err.response) {
                        console.log(err.response.data); console.log(err.response.status); console.log(err.response.headers);
                        res.status(err.response.status).json({ error: err.response.data });
                    } else if (err.request) {
                        console.log(err.request);
                        res.status(500).json({ error: 'No response from the server while making the create request.' });
                    } else {
                        console.log('Error', err.message);
                        res.status(500).json({ error: 'An error occurred while making the create request.' });
                    }
                }
            }
        }
        else{
            throw Error(`Couldn't identify if the operation is an update or an insertion`);
        }
    }
    catch(err) 
    {
        res.status(500).json({ error: err.message });
    }
});



async function getPropertiesData(){
    const propertiesRead = 'https://api.hubspot.com/crm/v3/properties/skills/batch/read';
    const propertiesReadList = 
    [
        {name:'complexity_level'},
        {name:'description'},
        {name:'execution_level'},
        {name:'music_genre'},
        {name:'name'},
        {name:'technique'}
    ];
    
    const headers = {
        authorization: `Bearer ${process.env.PRIVATE_APP_ACCESS}`,
        'content-type': 'application/json',
        'accept': 'application/json'
    };

    try
    {
        let params = { inputs: propertiesReadList };
        return axios.post(propertiesRead, params, { headers, httpsAgent: agent })
        .then(async (resp)=>
        {
            if(resp.data.results.length > 0)
            {
                let respProperties = resp.data.results.reduce((acc, item) => {
                    acc[item.name] = 
                    {
                        label: item.label,
                        options: item.options ? item.options.map(i => ({label: i.label, value: i.value})) : null
                    };
                    return acc;
                }, {});
                
                return respProperties; 
            } 
        })
        .catch((error) => 
        {
            console.error(error);
            return null;
        });
    } 
    catch (error) 
    {
        console.error(error);
        return null;
    }
}

async function getSkillsData(){
    let skillsData = [];
    let count = 0;
    let totalItems = 0;
    let span = 100;

    const skillsSearch = 'https://api.hubspot.com/crm/v3/objects/skills/search';
    const propertiesList = 
    [
        'complexity_level,description,execution_level,music_genre,name,technique'
    ];

        const headers = {
        authorization: `Bearer ${process.env.PRIVATE_APP_ACCESS}`,
        'content-type': 'application/json',
        'accept': 'application/json'
    };

    try
    {
        let propertiesData = await getPropertiesData();
    
        if(propertiesData) {
            try {

                do
                {
                    let params = { limit: span, after: (count*span), properties: propertiesList };
                    const resp = await axios.post(skillsSearch, params, { headers, httpsAgent: agent });
        
                    if(resp.data.total > 0)
                    {
                        if(count == 0)
                            totalItems = Math.ceil(resp.data.total / 100);
        
                            skillsData = resp.data.results.map(item => {
                                let technique = item.properties.technique;
                                let music_genre = item.properties.music_genre;
                                let complexity_level = item.properties.complexity_level;
                                let execution_level = item.properties.execution_level;
        
                                if (technique) {
                                    technique = technique.startsWith(";") ? technique.slice(1) : technique;
                                    technique = technique.split(";").map(value => {
                                        
                                        let option = null;
                                        
                                        let found = propertiesData.technique;
                                        if (found) 
                                        {
                                            option = found.options.find(opt => opt.value === value);
                                        }
                                        return option ? {label: option.label, value: option.value} : value;
                                    });
                                }
        
                                if (music_genre) {
                                    music_genre = music_genre.startsWith(";") ? music_genre.slice(1) : music_genre;
                                    music_genre = music_genre.split(";").map(value => {
                                        
                                        let option = null;
        
                                        let found = propertiesData.music_genre;
                                        if (found) 
                                        {
                                            option = found.options.find(opt => opt.value === value);
                                        }
                                        return option ? {label: option.label, value: option.value} : null;
                                    });
                                }
        
                                if (complexity_level) {
                                    
                                    let option = null;
        
                                    let found = propertiesData.complexity_level; 
        
                                    if (found) 
                                    {
                                        option = found.options.find(opt => opt.value === complexity_level);
                                    }
                                    complexity_level = option ? {label: option.label, value: option.value} : null;
                                }
        
                                if (execution_level) {
                                    
                                    let option = null;
        
                                    let found = propertiesData.execution_level; 
        
                                    if (found) 
                                    {
                                        option = found.options.find(opt => opt.value === execution_level);
                                    }
                                    execution_level = option ? {label: option.label, value: option.value} : null;
                                }
        
                                return {
                                    id: item.id,
                                    name: item.properties.name,
                                    technique: technique,
                                    music_genre: music_genre,
                                    complexity_level: complexity_level,
                                    execution_level: execution_level,
                                    description: item.properties.description,
                                };
                            });
        
                        count++;
                    }
                }
                while(count < totalItems);
                
                return {skillsData: skillsData, propertiesData: propertiesData};   
            } 
            catch (error) 
            {
                console.error(error);
                return null;
            }
        }
    }
    catch (error) 
    {
        console.error(error);
        return null;
    }
}

// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));
