# Timeliner

This was a project I worked on for keeping track of timelines in 2015/2016 , project was basically to keep track of crime timelines on TV shows etc.

I have refactored the JS in this project to be a bit more modern as of 1/27/2024.

# Using

This now requires a **Server** due to utilizing Temporal.js polyfill and module importing.

Open index.html via a local Server, go to Create or Bulk tab to start a timeline.

## Create Tab

 - Date format MM/DD/YYYY
 - Time format HH:MM AM/PM
 - Description of event
 - Click create button
 - Item will be added to the timeline and can now be found using search tab
 
 ## Bulk Tab
 
 Format of:
 
	mm/dd/yyyy
	hh:mm am/pm | description
	hh:mm am/pm | description
	hh:mm am/pm | description
 
 - Click create button
 - Items will be added to the timeline and can now be found using search tab
 - Bulk tab will only do one day at a time but you can do multiple times per day
 
 ## Save/Load Tab
 
 Click save button to get JSON string representing timeline
 
 Click load button after entering JSON string into load textbox
 
 Format for load string needs to be:
 
	[{"date":"MM/DD/YYYY","time":"HH:MM AM ","description":" Testing"},
	{"date":"MM/DD/YYYY","time":"HH:MM PM ","description":" Testing"}]