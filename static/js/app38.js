function buildMetadata(sample) {

    // @TODO: Complete the following function that builds the metadata panel

    // Use `d3.json` to fetch the metadata for a sample
    d3.json(`/metadata/${sample}`).then((received_metadata) => {
    // Use d3 to select the panel with id of `#sample-metadata`
    var my_panel = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    my_panel.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(received_metadata).forEach(([key,value]) => {
        my_panel.append("p").html(`${key} : ${value}`);
        
    });
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
    });
}

function buildCharts(sample) {

    // @TODO: Use `d3.json` to fetch the sample data for the plots
    d3.json(`/samples/${sample}`).then((received_data) => {

        // @TODO: Build a Bubble Chart using the sample data
        var bubbl_trace = [{
            x: received_data.otu_ids,
            y: received_data.sample_values,
            mode: 'markers',
            text: received_data.otu_labels,
            marker: {
                color: received_data.otu_ids,
                size: received_data.sample_values
            }
        }];

        var b_layout = {
            xaxis: {
                title: {
                    text: 'OTU IDS',
                    font: {
                        family: 'Courier New, monospace',
                        size: 18                        
                    }
                },
            },

            yaxis: {
                title: {
                    text: 'Sample Values',
                    font: {
                        family: 'Courier New, monospace',
                        size: 18                        
                    }
                },
            },
        };


        Plotly.newPlot("bubble", bubbl_trace, b_layout);


        // @TODO: Build a Pie Chart
        var my_list = [];
        for (var j = 0; j < received_data.sample_values.length; j++)
            my_list.push({ 'sample_values': received_data.sample_values[j], 'otu_ids': received_data.otu_ids[j], 'otu_labels': received_data.otu_labels[j] });

        my_list.sort((x, y) => y.sample_values - x.sample_values);
        my_list = my_list.slice(0, 10);
        var my_names = my_list.map(row => row.otu_labels);

        var trace = [{
            values: my_list.map(row => row.sample_values),
            labels: my_list.map(row => row.otu_ids),
            text: my_names,
            type: "pie",
            hoverinfo: 'text',
            textinfo: 'percent'
        }];

        Plotly.newPlot("pie", trace);
    });





    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
}

function init() {
    // Grab a reference to the dropdown select element  
    var selector = d3.select("#selDataset");
    // Use the list of sample names to populate the select options
    d3.json("/names").then((sampleNames) => {
        sampleNames.forEach((sample) => {
            selector
                .append("option")
                .text(sample)
                .property("value", sample);
        });

        // Use the first sample from the list to build the initial plots
        const firstSample = sampleNames[0];
        buildCharts(firstSample);
        buildMetadata(firstSample);
    });
}

function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected

    buildCharts(newSample);
    buildMetadata(newSample);
}

// Initialize the dashboard
init();
