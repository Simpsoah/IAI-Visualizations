IAI Force Directed Visualization
==================
### Description

### Requirements
A simple web server
Any modern browser (definition of "modern" to be determined)

### Environment setup
####Workspace setup
As this project uses Angular and JSON loading, you will **need** a simple web server to avoid cross-domain errors. No special configuration is needed. Just drop the files on a web server and point your browser to the page. 

I recommend an [EasyPHP Development Server](http://www.easyphp.org/easyphp-devserver.php) as it is low-profile, quick to configure, and it's really easyphp. 

####EasyPHP Windows configuration

* After installing EasyPHP, start the program. You should see a black **E** on your taskbar. Move to your project directory by right-clicking the E and selecting **Explore**. 
* Drop all of the project files here.
* Navigate your browser to **127.0.0.1/{PROJECT_DIR}**.
* Check the Developer Console in your browser to verify everything has loaded properly. 

## Data Requirements
* Download [this](http://wiki.cns.iu.edu/download/attachments/17727828/IAI-twitter-MayJune-interactionNet.cishellgraph.json?api=v2) data file and add it to **{PROJECT_DIR}/data**.
