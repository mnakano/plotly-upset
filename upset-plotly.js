/**
 * upset-plotly
 * 
 * makeUpset function generates intersections of input sets and values. 
 * The Taken from 'https://github.com/chuntul/d3-upset', and modified to accomodate color coding feature.
 * 
 * getPlotData generates color-coded plot data used by plotlyJS.
 * getBarLayout returns layout configuration for the bar plot portion of the upset plot.
 * getPointLayout returns layout configuration for the intersection points portion of the upset plot.
 */

 // plot colors to be used to color code each set. These are 20 randomly generated colors.
const plotColors = [
  '#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#6fbd22','#bcbd22','#17becf','#222AA1','#7DC922','#03F14A','#2F0248','#D31E70','#370E0F','#101A21','#FF9585','#BE93F6','#1CF4A5','#DACC14','#BB012F','#62AD27','#49947F','#A817D1','#159326','#652CBF','#1922A7','#2FC186','#6A0570'
]

function getBarLayout(barLength) {
  return(
    {
      autosize: true,
      xaxis: {
          showgrid: false,
          zeroline: false,
          showticklabels: false,
          range: [-1, barLength + 1]
      },
      yaxis: {
          tickfont: {
              size: 12
          },
          showgrid: true,
          showticklabels: true
      },
      margin: {t: 10, b: 0, l: 100, r: 10},
      showlegend: false
    }
  )
}

function getPointLayout(numPoints) {
  return(
    {
      autosize: true,
      xaxis: {
          showgrid: false,
          zeroline: false,
          showticklabels: false,
          range: [-1, numPoints + 1]
      },
      yaxis: {
          showgrid: true,
          tickfont: {
              size: 12
          },
          showticklabels: true
      },
      margin: {t: 0, b: 10, l: 100, r: 10},
      showlegend: false
    }
  )
}

function getPlotData(intersections, sets) {
  let bars = []
  let points = []

  for(let i = 0; i < intersections.length; i++){
                
    // Convert set indices into array of integers.
    intersections[i].setIndices = intersections[i].setIndices.split('-').filter(x => x).map(s => {return parseInt(s)})
    
    // Assign set names and colors to each intersection.
    let setNames = []
    let colors = []
    for(let j = 0; j < intersections[i].setIndices.length; j++){
        setNames.push(sets[intersections[i].setIndices[j]])
        colors.push(plotColors[intersections[i].setIndices[j]])
    }
    intersections[i].setNames = setNames
    intersections[i].colors = colors
  }

  for(let i = 0; i < intersections.length; i++){
      bars.push({
              x: [i, i],
              y: [0, intersections[i].names.length],
              mode: 'markers+lines',
              type: 'scatter',
              line: {
                  color: intersections[i].colors.length > 1 ? '#777777' : intersections[i].colors[0],
                  width: 10
              },
              marker: {
                  color: intersections[i].colors.length > 1 ? '#777777' : intersections[i].colors[0],
                  symbol: 'line-ew',
                  size: 10
              },
              text: intersections[i].names.length,
              hoverinfo: 'text'
      })
      
      points.push({
              x: new Array(intersections[i].setNames.length).fill(i),
              y: intersections[i].setNames,
              mode: intersections[i].setNames.length > 1 ? 'lines+markers' : 'markers',
              type: 'scatter',
              marker: {
                  size: 10,
                  color: intersections[i].colors
              },
              line: {
                  color: '#777777'
              },
              hoverinfo: 'text'
      }) 
  }
  return {bars: bars, points: points} 
}

function makeUpset(sets, names) { // names: [[],[]]

    var numSets = sets.length
  
    // computes intersections
    var data2 = []
      
    for (var i = 0; i < numSets; i++) {
      var intSet = {
        "set": i.toString(),
        "names": names[i],
        "setIndices": i.toString() + '-'
      }
      data2.push(intSet)
  
      for (var j = i + 1; j < numSets; j++) {
        var intSet2 = {
          "set": i.toString() + j.toString(),
          "names": findIntersection(names[i], names[j]),
          "setIndices": i.toString() + '-' + j.toString() + '-'
        }
        data2.push(intSet2)
        helperUpset(i, j+1, numSets, names, data2)
      }
    }
  
    //removing all solo datasets and replacing with data just in those datasets (cannot intersect with others)
    var tempData = []
    for (var i = 0; i < data2.length; i++) {
      if (data2[i].set.length != 1) { // solo dataset
        tempData.push(data2[i])
      }
    }
    data2 = tempData
    
  
    for (var i = 0; i < numSets; i++) {
      var inds = Array.apply(null, {length: numSets}).map(Function.call, Number)
      var index = inds.indexOf(i)
      if (index > -1) {
        inds.splice(index, 1);
      }
      //console.log(inds)
      data2.push({
        "set": i.toString(),
        "names": names[i],
        "setIndices": i.toString() + '-'
      })
    }
  
  
    // makes sure data is unique
    var unique = []
    var newData = []
    for (var i = 0; i < data2.length; i++) {
      if (unique.indexOf(data2[i].set) == -1) {
        unique.push(data2[i].set)
        newData.push(data2[i])
      }
    }
  
    var data = newData
  
    // sort data decreasing
    data.sort(function(a, b) {
      return parseFloat(b.names.length) - parseFloat(a.names.length);
    });

    return data

}

// takes two arrays of values and returns an array of intersecting values
function findIntersection(set1, set2) {
    //see which set is shorter
    var temp;
    if (set2.length > set1.length) {
        temp = set2; set2 = set1; set1 = temp;
    }

    return set1
        .filter(function(e) { //puts in the intersecting names
            return set2.indexOf(e) > -1;
        })
        .filter(function(e,i,c) { // gets rid of duplicates
            return c.indexOf(e) === i;
        })
}

//for the difference of arrays - particularly in the intersections and middles
//does not mutate any of the arrays
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

//for calculating solo datasets
function subtractUpset(i, inds, names) {
    var result = names[i].slice(0)
    for (var ind = 0; ind < inds.length; ind++) {
        // set1 vs set2 -> names[i] vs names[ind]
        for (var j = 0; j < names[inds[ind]].length; j++) { // for each element in set2
            if (result.includes(names[inds[ind]][j])) { 
                // if result has the element, remove the element
                // else, ignore
                var index = result.indexOf(names[inds[ind]][j])
                if (index > -1) {
                    result.splice(index, 1)
                }
            }
        }
    }
    return result
}

//recursively gets the intersection for each dataset
function helperUpset(start, end, numSets, names, data) {
    if (end == numSets) {
      return data
    }
    else {
      var intSet = {
        "set": data[data.length-1].set + end.toString(),
        "names": findIntersection(data[data.length-1].names, names[end]),
        "setIndices": data[data.length-1].setIndices + '-' + end.toString() + '-'
      }
      data.push(intSet)
      return helperUpset(start, end+1, numSets, names, data)
    }
}