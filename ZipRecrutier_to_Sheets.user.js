// ==UserScript==
// @name         ZipRecruiter Log & Filter
// @namespace    Makaze
// @version      0.1
// @description  try to take over the world!
// @author       Makaze
// @match        https://www.ziprecruiter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ziprecruiter.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    jQuery('article[data-applied-status="2"]').not(':has([data-quick-apply="one_click"])').remove();

    window.JobsDatabase = localStorage.getItem('jobs');
    JobsDatabase = (!JobsDatabase || !JobsDatabase.length) ? {} : JSON.parse(JobsDatabase);

    function checkArticles() {
    	jQuery('article[data-applied-status="2"]').not(':has([data-quick-apply="one_click"])').remove();

        JobsDatabase = localStorage.getItem('jobs');
        JobsDatabase = (!JobsDatabase || !JobsDatabase.length) ? {} : JSON.parse(JobsDatabase);

        jQuery('article[data-is-one-click], article:has([data-quick-apply="applied"])').each(function() {
            var $self = jQuery(this),
                jobLink = $self.find('.job_link').attr('href'),
                jobTitle = $self.find('.panel_job_title').attr('title'),
                companyName = $self.find('.hiring_company_name').text().trim(),
                jobLocation = $self.find('.job_location').text().trim(),
                remoteTag = $self.find('.remote_tag').length,
                jobType = $self.find('.perk_type').text().trim(),
                benefits = $self.find('.perk_benefit').text().trim(),
            	comp = $self.find('.perk_compensation').text().trim();

            jobTitle = jobTitle && jobTitle.length ? jobTitle : $self.find('.title').text().trim();
            companyName = companyName.length ? companyName : $self.find('.company_name').text().trim();
            jobLocation = jobLocation.length ? jobLocation : $self.find('.company_location').text().trim();
			comp = comp.length ? comp : $self.find('.perk_pay').text().trim();

            if (
                ($self.find('.successMessage').not(':visible')
                 && !$self.find('[data-quick-apply="applied"]').length)
                || JobsDatabase.hasOwnProperty(jobTitle + " @ " + companyName)) {
                return true;
            }

            JobsDatabase[jobTitle + " @ " + companyName] = {
                "link": jobLink,
                "title": jobTitle,
                "company": companyName,
                "location": jobLocation,
                "remote": (jobLocation.match('/remote/i') || remoteTag),
                "job_type": jobType,
                "benefits": benefits,
                "pay": comp,
                "date_applied": new Date().toLocaleDateString('en-us', {year:"numeric", month:"short", day:"numeric"}) 
            };
        });

        localStorage.setItem('jobs', JSON.stringify(JobsDatabase));
    }

    checkArticles();

    setInterval(checkArticles, 1000);

    jQuery(document).on('keydown', function(event) {
    	if (event.code == "KeyD" && event.altKey) {
    		event.preventDefault();

    		var table = "<table>";
    		//table += "<thead><tr><th>Company</th><th>Job Title</th><th>URL</th><th>Location</th><th>Remote</th><th>Type</th><th>Pay</th><th>Benefits</th><th>Date Applied</th></tr></thead>";
    		table += "<tbody>";
    		var thisJob;

    		for (var prop in JobsDatabase) {
    			if (JobsDatabase.hasOwnProperty(prop)) {
    				thisJob = JobsDatabase[prop];
    				table += "<tr><td>" + thisJob['company'] + "</td><td><a href=" + thisJob['link'] + ">" + thisJob['title'] + "</a></td><td><a href=" + thisJob['link'] + ">" + thisJob['link'] + "</a></td><td>" + thisJob['location'] + "</td><td>" + (thisJob['remote'] > 0 ? "Yes" : "No") + "</td><td>" + thisJob['job_type'] + "</td><td>" + thisJob['pay'] + "</td><td>" + thisJob['benefits'] + "</td><td>" + thisJob['date_applied'] + "</td></tr>";
    			}
    		}

    		table += "</tbody></table>";

    		var newWindow = window.open();

    		newWindow.document.write(table);
    	}
    });
})();