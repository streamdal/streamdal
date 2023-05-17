
** Super lightweight HTMX + Tailwind CSS embedded console. ** 


```shell
npm install 
npm start
```

Go to `localhost:3000` to see the console. 

To develop, update `/dist/index.html` and refresh the above page.  

FYI, the start command above will build the css, watch `index.html` and run 
a local http server. There is no other build step or dependencies, the `dist`
director contains the entire app and can be deployed statically. 