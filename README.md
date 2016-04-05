IAI Force Directed Visualization
==================
### Description

### Requirements
A simple web server
Any modern browser (definition of "modern" to be determined)

### Environment setup
####Workspace setup
This repository works as a component for the CNS-Frontend-Framework (https://github.iu.edu/CNS/CNS-Framework-Base). Pull/fork that repository and follow the instructions to set up the framework environment. 

###Deploy
After some minor configuration, this project may be completely built in one step. Run this command and fill out the data prompted by the script:
```sh
> grunt build-project-full
```

To avoid repeatedly entering this information, create a JSON file with the following contents: 
```sh
{
	"commitID": "",
	"visualizationName": "",
	"visualizationAlias": "",
	"projectName": "iai-twitter",
	"baseURL": "git@github.iu.edu:CNS/CNS-Framework-Base.git",
	"pluginsURL": "git@github.iu.edu:CNS/CNS-Framework-Plugins.git",
	"projectURL": "git@github.iu.edu:CNS/IAI-Visualizations.git"
}
```

Update the fields and run the following command:
```sh
> grunt build-project-full --config-dir={dirto/newjsonconfig.json}
```

As long as the --config-dir option is added, you will not be prompted for the fields you've entered in the file. 

###Run
The framework repository includes a .bat file that runs a web server and watch tasks. Two windows should be created with information relevant to each, including a port number.

Open a browser and navigate to localhost:{port}/deploy. 
