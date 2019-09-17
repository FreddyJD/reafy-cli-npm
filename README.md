[![Actions Status](https://github.com/juli-ai/reafy-cli/workflows/npm-master/badge.svg)](https://github.com/juli-ai/reafy-cli/actions)

Deploy easily your **react-app** to the cloud. The main difference between Reafy, and other providers is that we dont move your application to cold-storage when your app stop getting traffic. 

We encourage you to start using multiple providers. Make your back-end with Heroku or Zeit, and connect them with your Reafy front-end through your cool API.
![reafy-main](https://reafy.co/static/npm/NoColdStart.png)
To install the latest version of Reafy CLI run this command:


```

npm i reafy -g

```

  

How to deploy your app:

  

```

npm run build # Build your static app.

rea # Boom! deploy your app.

```

![enter image description here](https://reafy.co/static/npm/file.gif)

Rea is an alias of reafy.  
```

rea 
reafy

```


Dev note: We support any SPA with client-side rendering. So yes! **Angular and Vue** are welcome!. just build it and rename your **dist** folder **build**.

*[Reafy.co](https://reafy.co/) - Made with 🍀*

