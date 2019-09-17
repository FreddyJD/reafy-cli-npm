#!/usr/bin/env node
require('dotenv').config();

/* 
// This is the CLI for Reafy
// @Author: FreddyJD 
// @Description: CLI that helps you upload your SPA 
// to the cloud.
*/

const log = console.log;
const zip = require('cross-zip');
const inquirer = require('inquirer');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); 
const concat = require('concat-stream');
const FormData = require('form-data');
const exec = require('child_process').exec;
const reafy = chalk.cyan('Reafy → ');

function os_func() {
    this.execCommand = function (cmd) {
        return new Promise((resolve, reject)=> {
           exec(cmd, (error, stdout, stderr) => {
             if (error) {
                reject(error);
                return;
            }
            resolve(stdout)
           });
       })
   }
}


if (process.env.REAFY_SECRET_KEY && process.env.REAFY_APP_ID) {
	const REAFY_SECRET_KEY = process.env.REAFY_SECRET_KEY 
	const REAFY_APP_ID = process.env.REAFY_APP_ID

axios.get(`https://9s138x1rxe.execute-api.us-east-1.amazonaws.com/prod/verify/${REAFY_SECRET_KEY}/${REAFY_APP_ID}`)
	.then(async (response) => {
		const res = await uploadCloud(response.data.REAFY_SECRET_KEY, response.data.REAFY_APP_ID, response.data.REAFY_APP_NAME);
		return res
	})
	.catch(e => {
		log(reafy + chalk.red(e));
		log(reafy + chalk.red("We ran into a problem verifying your keys. "));
		log(reafy + chalk.green("Want to add a new app to your account?"));
		getKeys();

	})

} else {
	getKeys();
}


function getKeys() {
	inquirer
		.prompt([
			{
				type: 'list',
				name: 'registered',
				message: 'Are you registered?',
				choices: [ 'no', 'yes' ]
			},
			{
				type: 'input',
				name: 'email',
				message: "What's your email?",
			},
			{
				type: 'password',
				name: 'password',
				message: "Write a password",
			},
		])
		.then(async (answer) => {
			axios.post('https://9s138x1rxe.execute-api.us-east-1.amazonaws.com/prod/create', { data: answer })
			
			.then(async ({ data }) => {
				uploadCloud(data.REAFY_SECRET_KEY, data.REAFY_APP_ID, data.REAFY_APP_NAME);
		}).catch(e => {
			log(reafy + chalk.red(e))
			log(reafy + chalk.red("Wrong password or you exceded your limit 🙁 "))
		});
	})
	
}


async function uploadCloud(apiKey, appId, appName) {
	var inPath = path.join(process.cwd(), 'build/');
	var outPath = path.join(process.cwd(), 'reafy.zip');
	var existOutPath = fs.existsSync(outPath);
	var existInPath = fs.existsSync(inPath);

	if(!process.env.REAFY_SECRET_KEY){
		fs.appendFileSync(path.join(process.cwd(), '.env'), `REAFY_SECRET_KEY=${apiKey}\n`);
	}

	if(!process.env.REAFY_APP_ID){
		fs.appendFileSync(path.join(process.cwd(), '.env'), `REAFY_APP_ID=${appId}`);
	}

	if (!existInPath) {
		var os = new os_func();
		try {
			log(reafy + chalk.green('Trying to build your react app with - npm run build'));
			await os.execCommand('npm run build')
		}catch (e) {
			log(reafy + chalk.red(e));
			log(reafy +chalk.red('directory /build does not exist. Please do "npm run build" before uploading'));
			return;
		}
	}

	if (existOutPath) {
		log(reafy + chalk.green("Looks like we didn't clean up on the last build... cleannig up"));

		fs.unlinkSync(outPath);

		log(reafy + chalk.green('Removed successfully'));
	}

	log(reafy + chalk.green(`Zipping your cool app`));

	try { 
		

    zip.zipSync(inPath, outPath);
    
    const fd = new FormData();

	log(reafy + chalk.green(`Zipped! uploading to the cloud..`));

	fd.append('reafy.zip', fs.createReadStream(outPath));
	fd.pipe(
		concat({ encoding: 'buffer' }, async (data) => {
			 axios.post(`https://9s138x1rxe.execute-api.us-east-1.amazonaws.com/prod/deploy/${apiKey}/${appId}`, data, {
					headers: fd.getHeaders()
			})
		})
	);
	fd.on('end', () => {
		log(reafy + chalk.green('Cleaning zip file generated'));
		log(reafy + chalk.green(`Deployed successfully! https://${appName}.reafy.co/`));
		log(reafy + chalk.green(`Soon reafy.co/dashboard will be available`));
		log(reafy + chalk.green(`Your react app will be live in a few seconds 🌟`));
		fs.unlinkSync(outPath);
	})
    

	} catch (e) {
		log(reafy + chalk.red(e));
	}
}

