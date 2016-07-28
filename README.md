### Description
Our framework is aimed to make implementing a visualization into a webpage as painless as possible, while maintaining flexibility and extensibility. This tutorial will use an existing visualization as an example and go through the steps to build a new HTML page. But the same steps may be taken to include this project into an existing HTML page. 
### Step-by-step guide
In the code below, we are adding scripts solely for legacy Internet Explorer compatibility. These scripts add basic functionality lacking from most versions of Internet Explorer. We also manually bind some Angular functions (Note: the format, ng-xxx, indicates an Angular attribute and are required for the proper MVC binding).
```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <!--[if lte IE 7]>
            <script src="lib/json2.js"></script>
        <![endif]-->
        <!--[if lte IE 8]>
            <script src="//cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7/html5shiv.js"></script>    
            <script>
                document.createElement('ng-include');
                document.createElement('ng-pluralize');
                document.createElement('ng-view');
                document.createElement('ng:include');
                document.createElement('ng:pluralize');
                document.createElement('ng:view');
            </script>
        <![endif]-->
        <!--[if lte IE 9]>
            <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Page Name</title>
        <meta name="viewport" content="initial-scale=1.0,width=device-width" />
    </head>
    <body ng-cns-vis-runner>
    </body>
</html>
```
We need to include all Javascript and CSS files into the deployment directory. From the code provided here, copy the following folders to the top level of the web project:
* /css
* /lib
* /src
* /templates
* /visuals

These files include the Angular.js framework, our Javascript (D3.js) visualization package, and visualization stylesheets. While there are dozens of files in these folders, only a few need to be included in the HTML page due to the inclusion of the Head.js script. Head.js makes script loading easy by using Javscript to load all Javascript, JSON, and CSS dependencies asynchronously, but in order. So in the HTML page we only need to include the following dependencies in the <head> area above the <body>:
```html
<script src="lib/angular.min.js"></script>
<script src="lib/head.js"></script>
<script src="src/Init.js"></script>
 ```
* lib/angular.min.js loads Angular. This isn't included in the Head.js call, as it is needed to bind the elements before the rest of the scripts are loaded.
* lib/head.js loads the Head.js functions in order to make it usable.
* src/Init.js loads ALL of the other source files, executes the App.js script, and adds additional functionality and legacy Internet Explorer compatibility.
 
Notice the attribute on the <body> tag named ng-cns-vis-runner. This is an Angular directive that MUST be included that encapsulates ALL visualizations used. This directive helps us create visualization queues so we are able to retain the parent/component relationship and avoid errors caused by component visualizations attempting to load before their parental dependencies are ready. Next we need to include the DOM objects in the HTML page. In our example, these objects are included on the top level of the element. However, the visualizations will scale to the container it is placed in. Below is the Angular/HTML template for a simple visualization.
 ```html
<div ng-cns-visual
    id="vis-div"
    ng-vis-type="VisualizationName"
    ng-data-field=""
    ng-identifier="visualizationAlias">
</div>
```
With the code added, the visualizations should render properly. This document will be updated as necessary to reflect any structural changes. The full source is listed below.
```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <!--[if lte IE 7]>
            <script src="lib/json2.js"></script>
        <![endif]-->
        <!--[if lte IE 8]>
            <script src="//cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7/html5shiv.js"></script>    
            <script>
                document.createElement('ng-include');
                document.createElement('ng-pluralize');
                document.createElement('ng-view');
                document.createElement('ng:include');
                document.createElement('ng:pluralize');
                document.createElement('ng:view');
            </script>
        <![endif]-->
        <!--[if lte IE 9]>
            <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Page Name</title>
        <meta name="viewport" content="initial-scale=1.0,width=device-width" />
        <script src="lib/angular.min.js"></script>
        <script src="lib/head.js"></script>
        <script src="src/Init.js"></script>
    </head>
    <body ng-cns-vis-runner>
        <div ng-cns-visual
            id="vis-div"
            ng-vis-type="VisualizationName"
            ng-data-field="datamapattr"
            ng-identifier="visualizationAlias">
        </div>
    </body>
</html>
```

### Datasource Mapping
Notice in the code above, we are assigning the ng-data-field attribute to datamapattr. This gives our ng-cns-visual directive an attribute to look for in the datasource mapping (src/DatasourceMap.js). The data service will take this value and perform an HTTP request on the mapped URL.

To add a new data file and use it in your visualization, one must first copy the data file to the data/ directory. Copy the name and open the src/DatasourceMap.js file. Add a new entry to the globalDatasourceMap object. For standard use cases, we only need an identifier and a link. For the entries key, choose a descriptive alias that represents your data. For the url field, add the location of the data file. The root of this script is the root of the project. So if you have a data folder on the top level of your project, your url value will be: "data/publicationdata.json". The result will look like this:
 ```javascript
var globalDatasourceMap = {
    publications: {
        url: "data/publicationdata.json"
    }
} 
```
The included Angular data service will reference this map when determining (from the ng-data-field) values, which data files to load and store. So to use this data in a visualization, open your HTML file and find the appropriate ng-cns-visual object. 
```html
<div ng-cns-visual
    ...
    ng-data-field="publications"
    ...
>
</div>
```
If a user wishes, they may completely bypass the Datasource Map method and enter a URL directly into the ng-data-field attribute. If an entry for a value is not found, the data service will try to run the value it was passed. 
### Solr API Datasource
The data retrieval method for this datasource is not a one step process. Multiple queries need to be performed and each of the queries contains data needed to perform other queries. More details about the specifics of the query can be found in this document. In the deployed code, the file src/App.js contains the Angular data service we've created. The retrieveData function contains a workaround for this problem. If the datasource being requested is "master", the masterprocessor function will be run. This code was designed to implement the query specification document listed above.
The result of the data will appear like: 
```javascript
{
    pubs: {...},
    awards: {...},
    trials: {...},
    pubAwards: {...},
    awardPubs: {...},
    finalPubs: {schema:[],records:{schema:[],data:[]}},
    finalAwards: {schema:[],records:{schema:[],data:[]}},
    finalTrials: {schema:[],records:{schema:[],data:[]}}
}
```
The fields that start with "final" contain the finished data that we need to use.

To hook a visualization up to this part of the data service, you must specify: ng-data-field="master" in the visualization HTML. 

Unlike other processes that utilize one object from the Data service, this produces three datasets. The visualizations are rightfully not prepared to consume this structure, so we must first modify the data that gets passed to our visualization. In the configs of each of the visualizations (visuals/expertise/VISNAME-configs.js), we can set the filteredData object that the visualization uses to be only the necessary object we need. In the dataprep.VISNAME function, add the following line to the beginning of the function:
```javascript
ntwrk.filteredData = ntwrk.filteredData.finalFIELD;
```
Since we are using the same schema that the visualization expects in each of the final fields, we shouldn't need to update anything else (assuming the data follows the same structure as the current data).
 
**Warning: The code that exists is based on our knowledge of Solr APIs and the preliminary feed we received. It may need modification in order to run properly, including adding Access-Control-Allow-Origin headers to allow external systems to connect. The Solr configuration will also probably need to be modified to allow POST requests (not just GET) in order to accept the full filter list of partner institutions on queries.**

### Parent/Component Visualizations
One aspect of this framework is that a visualization can exist as a parent or component visualization. The difference is fairly arbitrary, as the inclusion of the ng-data-field attribute can make a component act as a parent. But, the usefulness comes when customizing out-of-the-box visualizations. For example, a component can be made to trigger a refresh to a visualization when something happens to a parent (DOM event, filter, etc). What we can do is recreate the component visualization using a manipulated dataset from it's parent. An example of this functionality comes when we apply a front-end filter to a parent visualization. From the parent, we can trigger the visualization to recreate itself with ONLY the filtered data from the parent instead of rewriting the filter entirely.
 
### Taking Components
The visualizations have been created in a way that they should automatically fit inside of existing HTML containers with a minor level of designing and styling. If one wishes to follow this document to enable WVF functionality on an existing page without using the styles and DOM elements created by CNS, the components may be copied out to a different HTML page. In the delivered code, /expertise.html contains comment blocks that show where each component is. Note that this will only give the basic items provided. The pattern is as follows:
```html
<!-- {CNS-VISUAL} Visualization Component Name -->
    --Code to copy--
<!-- /{CNS-VISUAL} Visualization Component Name -->
```
