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

const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

app.get('/', async (req, res) => {
    getSkillsData()
    .then(resp => {
        if(resp) {
            res.render('skills', { title: 'Skills | HubSpot APIs', data: resp.skillsData });
        }
    })
    .catch(error => {
        console.error(error);
    });
});

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

app.get('/update-cobj', async (req, res) => {
    getSkillsData()
    .then(resp => {
        if(resp) {
            res.render('updates', { title: 'UpSert Skills | HubSpot APIs', data: {skillsData: resp.skillsData, propertiesData: resp.propertiesData} });
        }
    })
    .catch(error => {
        console.error(error);
    });

});

// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

app.post('/update-cobj', async (req, res) => {

    //res.redirect('/update-cobj');
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
        authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
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
                let respProperties = resp.data.results.map
                (item => 
                    ({
                        label: item.label,
                        name: item.name,
                        options: item.options ? item.options.map(i => ({label: i.label, value: i.value})) : null
                    })
                );

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
        authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
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
                                        let nameToFind = 'technique';
                                        let option = null;
                                        
                                        let found = propertiesData.find(obj => obj.name === nameToFind);
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
                                        let nameToFind = 'music_genre';
                                        let option = null;
        
                                        let found = propertiesData.find(obj => obj.name === nameToFind);
                                        if (found) 
                                        {
                                            option = found.options.find(opt => opt.value === value);
                                        }
                                        return option ? {label: option.label, value: option.value} : null;
                                    });
                                }
        
                                if (complexity_level) {
                                    let nameToFind = 'complexity_level';
                                    let option = null;
        
                                    let found = propertiesData.find(obj => obj.name === nameToFind);
        
                                    if (found) 
                                    {
                                        option = found.options.find(opt => opt.value === complexity_level);
                                    }
                                    complexity_level = option ? {label: option.label, value: option.value} : null;
                                }
        
                                if (execution_level) {
                                    let nameToFind = 'execution_level';
                                    let option = null;
        
                                    let found = propertiesData.find(obj => obj.name === nameToFind);
        
                                    if (found) 
                                    {
                                        option = found.options.find(opt => opt.value === execution_level);
                                    }
                                    execution_level = option ? {label: option.label, value: option.value} : null;
                                }
        
                                return {
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
