let dataset, svg, genreData, areaData
let salarySizeScale, salaryXScale, categoryColorScale
let simulation, nodes
let categoryLegend, salaryLegend
let currentStep = 0

const categories = ['Musical', 'Adventure', 'Drama', 'Comedy', 'Action', 'Horror',
'Romantic Comedy','Thriller/Suspense', 'Western','Black Comedy', 'Concert/Performance','Documentary', 'Missing']

const genreMap = {
    "Musical" : 0,
    "Adventure" : 1,
    "Drama" : 2,
    "Comedy" : 3,
    "Action": 4, 
    "Horror": 5,
    "Romantic Comedy" : 6, 
    "Thriller/Suspense" : 7,
    "Western" : 8, 
    "Black Comedy": 9, 
    "Concert/Performance" : 10, 
    "Documentary" : 11,
    "Missing" : 12
}

const categoriesXY = {'Musical': [0, 550, 57382, 23.9],
                        'Adventure': [600, 800, 43538, 48.3],
                        'Drama': [0, 800, 41890, 50.9],
                        'Comedy': [0, 250, 42200, 48.3],
                        'Action': [300, 400, 42745, 31.2],
                        'Horror': [200, 600, 36900, 40.5],
                        'Romantic Comedy': [250, 800, 36342, 35.0],
                        'Thriller/Suspense': [400, 200, 33062, 60.4],
                        'Western': [500, 500, 36825, 79.5],
                        'Black Comedy': [400, 600, 37344, 55.4],
                        'Concert/Performance': [300, 700, 36421, 58.7],
                        'Documentary': [600, 200, 32350, 74.9],
                        'Missing': [600, 400, 31913, 63.2]}

const margin = {left: 170, top: 50, bottom: 50, right: 20}
const width = 1000 - margin.left - margin.right
const height = 950 - margin.top - margin.bottom

//Read Data, convert numerical categories into floats
//Create the initial visualisation


// d3.csv('data/recent-grads.csv', function(d){
//     return {
//         Major: d.Major,
//         Total: +d.Total,
//         Men: +d.Men,
//         Women: +d.Women,
//         Median: +d.Median,
//         Unemployment: +d.Unemployment_rate,
//         Category: d.Major_category,
//         ShareWomen: +d.ShareWomen, 
//         HistCol: +d.Histogram_column,
//         Midpoint: +d.midpoint
//     };
// }).then(data => {
//     dataset = data
//     console.log(dataset)
//     createScales()
//     setTimeout(drawInitial(), 100)
// })

d3.csv('data/disney_movies_total_gross.csv', function(d){
    return {
        title: d["movie_title"],
        releaseDate: d["release_date"],
        date: d3.timeParse("%b %d, %Y")(d["release_date"]),
        genre: d.genre,
        rating: d["MPAA_rating"],
        totalGross: Number(d["total_gross"].replace(/[^0-9\.-]+/g,"")),
        adjGross: Number(d["inflation_adjusted_gross"].replace(/[^0-9\.-]+/g,""))
    };
}).then(data => {
    dataset = data
    console.log(dataset)
    data.sort((a,b) => a.totalGross < b.totalGross ? 1 : -1);
    dataset = data;
    // console.log(dataset)
    // dataset = dataset.map(d => d.genre === "" ? "Missing" : d.genre);
    // console.log(datta)
    dataset = data.map(function(d){
        return d.genre === "" ? {...d, genre: "Missing"}: d;
    })

    genreData = [
        {genre: 'Musical',
        income: 0 }, 
        {genre: 'Adventure',
        income: 0 }, 
        {genre: 'Drama',
        income: 0 }, 
        {genre: 'Comedy',
        income: 0 }, 
        {genre: 'Action',
        income: 0 }, 
        {genre: 'Horror',
        income: 0 }, 
        {genre: 'Romantic Comedy',
        income: 0 }, 
        {genre: 'Thriller/Suspense',
        income: 0 }, 
        {genre: 'Western',
        income: 0 }, 
        {genre: 'Black Comedy',
        income: 0 }, 
        {genre: 'Concert/Performance',
        income: 0 }, 
        {genre: 'Documentary',
        income: 0 }, 
        {genre: 'Missing',
        income: 0 }, 
    ]

    // 'Adventure', 'Drama', 'Comedy', 'Action', 'Horror',
    //     'Romantic Comedy','Thriller/Suspense', 'Western','Black Comedy', 'Concert/Performance','Documentary', 'Missing'
    dataset.forEach(function (d) {
        let index = genreMap[d.genre ?? "Missing"];
        // console.log("INDEX", index);
        genreData[index].income += d.totalGross;


    })

    genreData.sort((a,b) => (a.income > b.income) ? -1 : 1)
    console.log("genre data", genreData);

    areaData = d3
                .nest()
                .key(function(d) { return d3.timeYear(d.date)})
                .rollup(function(d) {
                    return {
                        totalGross: d3.sum(d, g => g.totalGross),
                        "Musical": {
                            totalGross: d3.sum(d, function(g){
                                return g.genre == "Musical" ? g.totalGross : 0;
                            }),
                            adjGross: d3.sum(d, function(g){
                                return g.genre == "Musical" ? g.adjGross : 0;
                            })
                        },
                        "Adventure": {
                            totalGross: d3.sum(d, function(g){
                                return g.genre == "Adventure" ? g.totalGross : 0;
                            }),
                            adjGross: d3.sum(d, function(g){
                                return g.genre == "Adventure" ? g.adjGross : 0;
                            })
                        },
                        "Drama": {
                            totalGross: d3.sum(d, function(g){
                                return g.genre == "Drama" ? g.totalGross : 0;
                            }),
                            adjGross: d3.sum(d, function(g){
                                return g.genre == "Drama" ? g.adjGross : 0;
                            })
                        },
                        "Comedy": {
                            totalGross: d3.sum(d, function(g){
                                return g.genre == "Comedy" ? g.totalGross : 0;
                            }),
                            adjGross: d3.sum(d, function(g){
                                return g.genre == "Comedy" ? g.adjGross : 0;
                            })
                        },
                        "Action": {
                            totalGross: d3.sum(d, function(g){
                                return g.genre == "Action" ? g.totalGross : 0;
                            }),
                            adjGross: d3.sum(d, function(g){
                                return g.genre == "Action" ? g.adjGross : 0;
                            })
                        },
                        "Horror": {
                            totalGross: d3.sum(d, function(g){
                                return g.genre == "Horror" ? g.totalGross : 0;
                            }),
                            adjGross: d3.sum(d, function(g){
                                return g.genre == "Horror" ? g.adjGross : 0;
                            })
                        },
                        "Romantic Comedy": {
                            totalGross: d3.sum(d, function(g){
                                return g.genre == "Romantic Comedy" ? g.totalGross : 0;
                            }),
                            adjGross: d3.sum(d, function(g){
                                return g.genre == "Romantic Comedy" ? g.adjGross : 0;
                            })
                        },
                        "Thriller/Suspense": {
                            totalGross: d3.sum(d, function(g){
                                return g.genre == "Thriller/Suspense" ? g.totalGross : 0;
                            }),
                            adjGross: d3.sum(d, function(g){
                                return g.genre == "Thriller/Suspense" ? g.adjGross : 0;
                            })
                        },
                        "Western": {
                            totalGross: d3.sum(d, function(g){
                                return g.genre == "Western" ? g.totalGross : 0;
                            }),
                            adjGross: d3.sum(d, function(g){
                                return g.genre == "Western" ? g.adjGross : 0;
                            })
                        },
                        "Black Comedy": {
                            totalGross: d3.sum(d, function(g){
                                return g.genre == "Black Comedy" ? g.totalGross : 0;
                            }),
                            adjGross: d3.sum(d, function(g){
                                return g.genre == "Black Comedy" ? g.adjGross : 0;
                            })
                        },
                        "Concert/Performance": {
                            totalGross: d3.sum(d, function(g){
                                return g.genre == "Concert/Performance" ? g.totalGross : 0;
                            }),
                            adjGross: d3.sum(d, function(g){
                                return g.genre == "Concert/Performance" ? g.adjGross : 0;
                            })
                        },
                        "Documentary": {
                            totalGross: d3.sum(d, function(g){
                                return g.genre == "Documentary" ? g.totalGross : 0;
                            }),
                            adjGross: d3.sum(d, function(g){
                                return g.genre == "Documentary" ? g.adjGross : 0;
                            })
                        },
                        "Missing": {
                            totalGross: d3.sum(d, function(g){
                                // console.log("G",g);
                                return g.genre === "Missing" ? g.totalGross : 0;
                            }),
                            adjGross: d3.sum(d, function(g){
                                return g.genre === "Missing" ? g.adjGross : 0;
                            })
                        },
                        adjGross: d3.sum(d, g => g.adjGross)
                    }
                })
                .entries(dataset);
    
    areaData.sort((a,b) => (new Date(a.key) < new Date(b.key)) ? -1 : 1)

    areaData.map(d => d.key = new Date(d.key))

    console.log("AREA DATA", areaData);

    // dataset = data;
    createScales()
    setTimeout(drawInitial(), 2000)
})

const colors = ['#ffcc00', '#ff6666', '#cc0066', '#66cccc', '#f688bb', '#65587f', '#baf1a1', '#333333', '#75b79e',  '#66cccc', '#9de3d0', '#f1935c', '#0c7b93']

// , '#eab0d9', '#baf1a1', '#9399ff'

//Create all the scales and save to global variables

function createScales(){

    grossIncSizeScale = d3.scaleLinear(d3.extent(dataset, d => d.totalGross), [5, 35])

    grossIncXScale = d3.scaleLinear(d3.extent(dataset, d => d.totalGross), [margin.left, margin.left + width+ 550])

    categoryColorScale = d3.scaleOrdinal(categories, colors)


    grossIncYScale = d3.scaleLinear().domain([0, d3.max(dataset, function(d) { return d.totalGross})]).range([margin.top + height, margin.top])

    xAreaScale = d3.scaleTime().domain(d3.extent(areaData, d => d.key)).range([margin.left, margin.left + width])

    yAreaScale = d3.scaleLinear().domain([0, d3.max(areaData, d => d.value.totalGross)]).range([margin.top + height /2, margin.top])

    yAreaAdjScale = d3.scaleLinear().domain([0, d3.max(areaData, d => d.value.adjGross)]).range([margin.top + height / 2, margin.top])

}

function createLegend(x, y){
    let svg = d3.select('#legend')

    svg.append('g')
        .attr('class', 'categoryLegend')
        .attr('transform', `translate(${x},${y})`)

    categoryLegend = d3.legendColor()
                            .shape('path', d3.symbol().type(d3.symbolCircle).size(150)())
                            .shapePadding(10)
                            .scale(categoryColorScale)
    
    d3.select('.categoryLegend')
        .call(categoryLegend)
}

function createSizeLegend(){
    let svg = d3.select('#legend2')
    svg.append('g')
        .attr('class', 'sizeLegend')
        .attr('transform', `translate(100,50)`)

    sizeLegend2 = d3.legendSize()
        .scale(grossIncSizeScale)
        .shape('circle')
        .shapePadding(15)
        .title('Salary Scale')
        .labelFormat(d3.format("$,.2r"))
        .cells(7)

    d3.select('.sizeLegend')
        .call(sizeLegend2)
}

function createSizeLegend2(){
    let svg = d3.select('#legend3')
    svg.append('g')
        .attr('class', 'sizeLegend2')
        .attr('transform', `translate(50,100)`)

    sizeLegend2 = d3.legendSize()
        .scale(enrollmentSizeScale)
        .shape('circle')
        .shapePadding(55)
        .orient('horizontal')
        .title('Enrolment Scale')
        .labels(['1000', '200000', '400000'])
        .labelOffset(30)
        .cells(3)

    d3.select('.sizeLegend2')
        .call(sizeLegend2)
}

// All the initial elements should be create in the drawInitial function
// As they are required, their attributes can be modified
// They can be shown or hidden using their 'opacity' attribute
// Each element should also have an associated class name for easy reference

function drawInitial(){
    // createSizeLegend()
    // createSizeLegend2()

    let svg = d3.select("#vis")
                    .append('svg')
                    .attr('width', 1000)
                    .attr('height', 950)
                    .attr('opacity', 1)

    let xAxis = d3.axisBottom(grossIncXScale)
                    .ticks(4)
                    .tickSize(height + 80)

    let xAxisGroup = svg.append('g')
        .attr('class', 'first-axis')
        .attr('transform', 'translate(0, 0)')
        .call(xAxis)
        .call(g => g.select('.domain')
            .remove())
        .call(g => g.selectAll('.tick line'))
            .attr('stroke-opacity', 0.2)
            .attr('stroke-dasharray', 2.5)

    // Instantiates the force simulation
    // Has no forces. Actual forces are added and removed as required

    simulation = d3.forceSimulation(dataset)

     // Define each tick of simulation
    simulation.on('tick', () => {
        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
    })

    // Stop the simulation until later
    simulation.stop()

    // CREATION OF NODES THAT MAKES THE FIRST GRAPH

    // Selection of all the circles 
    nodes = svg
        .selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
            .attr('fill', '#98a398')
            .attr('r', 3)
            .attr('cx', (d, i) => grossIncXScale(d.totalGross) + 5)
            .attr('cy', (d, i) => i * 5.2 + 30)
            .attr('opacity', 0.8)
        
    // Add mouseover and mouseout events for all circles
    // Changes opacity and adds border
    svg.selectAll('circle')
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)

    function mouseOver(d, i){
        if(currentStep == 0 || currentStep == 1 || currentStep == 2){
            d3.select(this)
            .transition('mouseover').duration(100)
            .attr('opacity', 1)
            .attr('stroke-width', 5)
            .attr('stroke', 'black')
            
        d3.select('#tooltip')
            .style('left', (d3.event.pageX + 10)+ 'px')
            .style('top', (d3.event.pageY - 25) + 'px')
            .style('display', 'inline-block')
            .html(`<strong>Movie:</strong> ${d.title} 
                <br> <strong>Gross Income:</strong> $${d3.format(",.2r")(d.totalGross)} 
                <br> <strong>Adjusted Gross Income:</strong> $${d3.format(",.2r")(d.adjGross)}
                <br> <strong>Release Date:</strong> ${d.releaseDate}
                <br> <strong>Genre:</strong> ${d.genre}
                <br> <strong>Rating:</strong> ${d.rating}`)
        }
        
    }
    
    function mouseOut(d, i){
        if(currentStep == 0 || currentStep == 1 || currentStep == 2){
            d3.select('#tooltip')
                .style('display', 'none')

            d3.select(this)
                .transition('mouseout').duration(100)
                .attr('opacity', 0.8)
                .attr('stroke-width', 0)
        }
        
    }

    // ============================= VISUALIZATION SET UP FOR AREA CHARTS ============================= //

    //Small text label for first graph
    svg.selectAll('.small-text')
        .data(dataset)
        .enter()
        .append('text')
            .text((d, i) => d.title.toLowerCase())
            .attr('class', 'small-text')
            .attr('x', margin.left)
            .attr('y', (d, i) => i * 5.2 + 30)
            .attr('font-size', 7)
            .attr('text-anchor', 'end')
    

            let xTimeAxis = d3.axisBottom(xAreaScale);

            let xTimeAxisGroup = svg.append('g')
                .call(xTimeAxis)
                .attr('class', 'area-x')
                .attr('opacity', 0)
                .attr('transform', `translate(0, ${margin.top + 700})`)
                .call(g => g.select('.domain')
                    .remove())
                .call(g => g.selectAll('.tick line'))
                    .attr('stroke-opacity', 1)
                    .attr('stroke-dasharray', 1.5)
        
        
            let yIncAxis = d3.axisLeft(yAreaAdjScale).ticks(5).tickSize([width]).tickFormat(function(d){ return "$" + d/1000000000 + " billion"})
                    
            let yIncAxisGroup = svg.append('g')
                .call(yIncAxis)
                .attr('class', 'area-y')
                .attr('opacity', 0)
                .attr('transform', `translate(${margin.left + width}, 275)`)
                .call(g => g.select('.domain')
                    .remove())
                .call(g => g.selectAll('.tick line'))
                    .attr('stroke-opacity', 0.2)
                    .attr('stroke-dasharray', 2.5)
                    
            
            const areaGenerator = d3.area()
                                    .x(d => xAreaScale(d.key))  
                                    .y0(yAreaAdjScale(0))  
                                    .y1(d => yAreaAdjScale(d.value.totalGross))    
                                    .curve(d3.curveBasis)
        
            svg.append('g').append("path")
                .attr('class', 'area-path')
                .attr('transform', `translate(0, 275)`)
                // .attr("stroke", "steelblue")
                .attr("fill", "#cce5df")
                .attr("stroke", "#69b3a2")
                .attr("stroke-width", 1.5)
                .attr('opacity', 0)
                .attr('d', areaGenerator(areaData))
    


    // ============================= VISUALIZATION 4 : AREA ADJ GROSS CHART ============================= //

    let yAdjIncAxis = d3.axisLeft(yAreaAdjScale).ticks(5).tickSize([width]).tickFormat(function(d){ return "$" + d/1000000000 + " billion"})
            
    let yAdjIncAxisGroup = svg.append('g')
        .call(yAdjIncAxis)
        .attr('class', 'adj-area-y')
        .attr('opacity', 0)
        .attr('transform', `translate(${margin.left + width}, 275)`)
        .call(g => g.select('.domain')
            .remove())
        .call(g => g.selectAll('.tick line'))
            .attr('stroke-opacity', 0.2)
            .attr('stroke-dasharray', 2.5)
            

    const adjAreaGenerator = d3.area()
                            .x(d => xAreaScale(d.key))  
                            .y0(yAreaAdjScale(0))  
                            .y1(d => yAreaAdjScale(d.value.adjGross))    
                            .curve(d3.curveBasis)

    svg.append('g').append("path")
        .attr('class', 'adj-area-path')
        .attr('transform', `translate(0, 275)`)
        // .attr("stroke", "steelblue")
        .attr("fill", "#f0dfb4")
        .attr("stroke", "#d1b05a")
        .attr("stroke-width", 1.5)
        .attr('opacity', 0)
        .attr('d', adjAreaGenerator(areaData))


    // ============================= VISUALIZATION SET UP FOR LINE CHARTS ============================= //
    var xLineScale = d3.scaleTime().domain(d3.extent(areaData, d => d.key)).range([margin.left, margin.left + width]);

    var yLineScale = d3.scaleLinear().domain([0, d3.max(areaData, d => d.value.adjGross)]).range([margin.top + height/2, margin.top]);

    let xLineAxis = d3.axisBottom(xLineScale);
    let yLineAxis = d3.axisLeft(yLineScale).tickSize([width]).tickFormat(function(d){ return "$" + d/1000000000 + " billion"})

    let xLineAxisG = svg.append('g')
                .call(xLineAxis)
                .attr('class', 'line-x')
                .attr('opacity', 0)
                .attr('transform', `translate(0, ${margin.top + 700})`)
                .call(g => g.select('.domain')
                    .remove())
                .call(g => g.selectAll('.tick line'))
                    .attr('stroke-opacity', 1)
                    .attr('stroke-dasharray', 1.5)

    let yLineAxisG = svg.append('g')
                .call(yLineAxis)
                .attr('class', 'line-y')
                .attr('opacity', 0)
                .attr('transform', `translate(${margin.left + width}, 275)`)
                .call(g => g.select('.domain')
                    .remove())
                .call(g => g.selectAll('.tick line'))
                    .attr('stroke-opacity', 0.2)
                    .attr('stroke-dasharray', 2.5)

    const lineGenerator = d3.line()
                    .x(d => xLineScale(d.key))  
                    .y(d => yLineScale(d.value.Musical.adjGross))    
                    .curve(d3.curveBasis)
    
    var genreLine = svg.append('g').append("path")
        .attr('class', 'line-path')
        .attr('transform', `translate(0, 275)`)
        // .attr("stroke", "steelblue")
        .attr("fill", "none")
        .attr("stroke", "#ffcc00")
        .attr("stroke-width", 1.5)
        .attr('opacity', 0)
        .attr('d', lineGenerator(areaData))

    // CREATE THE SELECTION OPTIONS
    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(categories)
        .enter()
        .append('option')
        .text(function (d) { return d;})
        .attr("value", d => d);

    function update(selectedGroup){
        console.log("Updating", selectedGroup);
        console.log("area data", areaData)
        xLineScale = d3.scaleTime().domain(d3.extent(areaData, d => d.key)).range([margin.left, margin.left + width]);
        yLineScale = d3.scaleLinear().domain([0, d3.max(areaData, d => d.value[selectedGroup].adjGross)]).range([margin.top + height/2, margin.top]);
        xLineAxis = d3.axisBottom(xLineScale);
        yLineAxis = d3.axisLeft(yLineScale).tickSize([width]).tickFormat(function(d){ return "$" + d/1000000000 + " billion"})

        

        xLineAxisG.transition().duration(1000).call(xLineAxis);

        yLineAxisG.transition().duration(1000).call(yLineAxis);

        genreLine
            .datum(areaData)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .x(d => xLineScale(d.key))
                .y(d => yLineScale(d.value[selectedGroup].adjGross))   
                .curve(d3.curveBasis)
            )
            .attr("stroke", d => colors[genreMap[selectedGroup]])
    }

    d3.select("#selectButton")
        .on("change", function(d){
            var selectedOption = d3.select(this).property("value")
            update(selectedOption)
        })

    // ============================= VISUALIZATION 5 : BAR CHARTS ============================= //

    xGenreScale = d3.scaleLinear().domain(d3.extent(genreData, d => d.income)).range([margin.left, margin.left + width])
    yGenreScale = d3.scaleBand().range([margin.top + 250, margin.top + height]).domain(genreData.map(d=> d.genre)).padding(.1);

    let xGenreAxis = d3.axisBottom(xGenreScale).tickSize(-height + 250).tickFormat(function(d){ return "$" + d/1000000000 + " billion"});

    let xGenreAxisG = svg.append('g')
        .attr('class', 'genre-chart-x')
        .attr('transform', `translate(0, ${height + margin.top - 100})`)
        .attr('opacity', 0)
        .call(xGenreAxis)
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line'))
            .attr('stroke-opacity', 0.2)
            .attr('stroke-dasharray', 2.5)
    
    let yGenreAxis = d3.axisLeft(yGenreScale)

    let yGenreAxisG = svg.append('g')    
        .attr('class', 'genre-chart-y')
        .attr('opacity', 0)
        .attr('transform', `translate(${margin.left}, -100)`)
        .call(yGenreAxis)
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line'))
            .attr('stroke-opacity', 0.2)
            .attr('stroke-dasharray', 2.5)


    svg.selectAll('myRect')
        .data(genreData)
        .enter()
        .append("rect")
        .attr('class', "genre-rects")
        .attr('opacity', 0)
        .attr("x", xGenreScale(0))
        .attr("y", function(d){
            // console.log("doing", d.genre)
            return yGenreScale(d.genre) - 100;
        })
        .attr("width", function(d){
            // console.log("wow", yGenreScale(100000));
            return xGenreScale(0)
        })
        .attr("height", yGenreScale.bandwidth())
        .attr("fill", function(d){
            return colors[genreMap[d.genre]];
        })
}

//Cleaning Function
//Will hide all the elements which are not necessary for a given chart type 

function clean(chartType){
    let svg = d3.select('#vis').select('svg')
    if (chartType !== "isScatter") {
        svg.select('.scatter-x').transition().attr('opacity', 0)
        svg.select('.scatter-y').transition().attr('opacity', 0)
        svg.select('.best-fit').transition().duration(200).attr('opacity', 0)
    }
    if (chartType !== "isMultiples"){
        svg.selectAll('.lab-text').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.cat-rect').transition().attr('opacity', 0)
            .attr('x', 1800)
    }
    if (chartType !== "isFirst"){
        svg.select('.first-axis').transition().attr('opacity', 0)
        svg.selectAll('.small-text').transition().attr('opacity', 0)
            .attr('x', -200)
    }
    if (chartType !== "isHist"){
        svg.selectAll('.hist-axis').transition().attr('opacity', 0)
    }
    if (chartType !== "isBubble"){
        svg.select('.enrolment-axis').transition().attr('opacity', 0)
    }
    if (chartType !== "isArea"){
        svg.select('.area-x').transition().attr('opacity', 0)
        svg.select('.area-y').transition().attr('opacity', 0)
        svg.select('.area-path').transition().attr('opacity', 0)
    }
    if (chartType !== "isAdjArea"){
        svg.select('.area-x').transition().attr('opacity', 0)
        svg.select('.adj-area-y').transition().attr('opacity', 0)
        svg.select('.adj-area-path').transition().attr('opacity', 0)
    }
    if(chartType !== "isBarChart"){
        svg.select('.genre-chart-x').transition().attr('opacity', 0)
        svg.select('.genre-chart-y').transition().attr('opacity', 0)
        svg.selectAll('.genre-rects').transition().attr('opacity', 0).attr("width", function(d){
            return xGenreScale(0)
        })
    }
    if(chartType !== 'isGenreLineChart'){
        svg.select('.line-x').transition().attr('opacity', 0)
        svg.select('.line-y').transition().attr('opacity', 0)
        svg.select('.line-path').transition().attr('opacity', 0)
    }
}

//First draw function

function draw1(){
    currentStep = 1
    //Stop simulation
    simulation.stop()
    
    let svg = d3.select("#vis")
                    .select('svg')
                    .attr('width', 1000)
                    .attr('height', 950)
    
    clean('isFirst')

    d3.select('.categoryLegend').transition().remove()

    svg.select('.first-axis')
        .attr('opacity', 1)
    
    svg.selectAll('circle')
        .transition().duration(500).delay(100)
        .attr('fill', '#98a398')
        .attr('r', 3)
        .attr('cx', (d, i) => grossIncXScale(d.totalGross)+5)
        .attr('cy', (d, i) => i * 5.2 + 30)

    svg.selectAll('.small-text').transition()
        .attr('opacity', 1)
        .attr('x', margin.left)
        .attr('y', (d, i) => i * 5.2 + 30)
}


function draw2(){
    currentStep = 2;
    let svg = d3.select("#vis").select('svg')

    
    clean('none')

    svg.selectAll('circle')
        .transition().duration(300).delay((d, i) => i * 1)
        .attr('r', d => grossIncSizeScale(d.totalGross) * 1.2)
        .attr('fill', d => categoryColorScale(d.genre))
        .attr('opacity', 1)

    simulation  
        .force('charge', d3.forceManyBody().strength([2]))
        .force('forceX', d3.forceX(function(d) {
            // console.log(d.genre);
            return categoriesXY[d.genre][0] + 200
        } ))
        .force('forceY', d3.forceY(d => categoriesXY[d.genre][1] - 50))
        .force('collide', d3.forceCollide(d => grossIncSizeScale(d.totalGross) + 4))
        .alphaDecay([0.02])

    //Reheat simulation and restart
    simulation.alpha(0.9).restart()
    
    createLegend(20, 50)
}

function draw3(){
    currentStep = 3;
    let svg = d3.select("#vis").select('svg')
    clean('isArea')
    
    svg.selectAll('circle')
        .transition().duration(100).delay((d, i) => i * 2)
        .attr("opacity", 0)
        .attr('cx', margin.left + width)
        .attr('cy', height /2)

    svg.select('.area-path').transition().duration(1400).attr('opacity', .7);
    svg.select('.area-x').transition().duration(1400).attr('opacity', 1);
    svg.select('.area-y').transition().duration(1400).attr('opacity', 1);


}

function draw4(){
    clean('isAdjArea');

    currentStep = 4;

    console.log("drawing 4");
    let svg = d3.select('#vis').select('svg')

    svg.select('.adj-area-path').transition().duration(700).attr('opacity', .7);
    svg.select('.area-x').transition().duration(700).attr('opacity', 1);
    svg.select('.adj-area-y').transition().duration(700).attr('opacity', 1);

}

function draw5(){

    clean("isStackedAreaChart")
    currentStep = 5;
    let svg = d3.select('#vis').select('svg')

    svg.select('.adj-area-path').transition().duration(700).attr('opacity', .5);
    svg.select('.area-path').transition().duration(700).attr('opacity', 1);
    svg.select('.area-x').transition().duration(700).attr('opacity', 1);
    svg.select('.adj-area-y').transition().duration(700).attr('opacity', 1);
    
    // let svg = d3.select('#vis').select('svg')
    // clean('isMultiples')

    // simulation
    //     .force('forceX', d3.forceX(d => categoriesXY[d.Category][0] + 200))
    //     .force('forceY', d3.forceY(d => categoriesXY[d.Category][1] - 50))
    //     .force('collide', d3.forceCollide(d => salarySizeScale(d.Median) + 4))

    // simulation.alpha(1).restart()
   
    // svg.selectAll('.lab-text').transition().duration(300).delay((d, i) => i * 30)
    //     .text(d => `% Female: ${(categoriesXY[d][3])}%`)
    //     .attr('x', d => categoriesXY[d][0] + 200)   
    //     .attr('y', d => categoriesXY[d][1] + 50)
    //     .attr('opacity', 1)
    
    // svg.selectAll('.lab-text')
    //     .on('mouseover', function(d, i){
    //         d3.select(this)
    //             .text(d)
    //     })
    //     .on('mouseout', function(d, i){
    //         d3.select(this)
    //             .text(d => `% Female: ${(categoriesXY[d][3])}%`)
    //     })
   
    // svg.selectAll('.cat-rect').transition().duration(300).delay((d, i) => i * 30)
    //     .attr('opacity', 0.2)
    //     .attr('x', d => categoriesXY[d][0] + 120)

    // svg.selectAll('circle')
    //     .transition().duration(400).delay((d, i) => i * 4)
    //         .attr('fill', colorByGender)
    //         .attr('r', d => salarySizeScale(d.Median))

}

function colorByGender(d, i){
    if (d.ShareWomen < 0.4){
        return 'blue'
    } else if (d.ShareWomen > 0.6) {
        return 'red'
    } else {
        return 'grey'
    }
}

function draw6(){
    clean("isGenreLineChart")
    currentStep = 6;
    
    // simulation.stop()
    
    let svg = d3.select("#vis").select("svg")

    // svg.select('.adj-area-path').transition().duration(700).attr('opacity', .5);
    // svg.select('.area-path').transition().duration(700).attr('opacity', 1);
    svg.select('.line-x').transition().duration(700).attr('opacity', 1);
    svg.select('.line-y').transition().duration(700).attr('opacity', 1);
    svg.select('.line-path').transition().duration(700).attr('opacity', 1);

    // clean('isScatter')

    // svg.selectAll('.scatter-x').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)
    // svg.selectAll('.scatter-y').transition().attr('opacity', 0.7).selectAll('.domain').attr('opacity', 1)

    // svg.selectAll('circle')
    //     .transition().duration(800).ease(d3.easeBack)
    //     .attr('cx', d => shareWomenXScale(d.ShareWomen))
    //     .attr('cy', d => salaryYScale(d.Median))
    
    // svg.selectAll('circle').transition(1600)
    //     .attr('fill', colorByGender)
    //     .attr('r', 10)

    // svg.select('.best-fit').transition().duration(300)
    //     .attr('opacity', 0.5)
   
}

function draw7(){
    let svg = d3.select('#vis').select('svg')
    currentStep = 7;
    console.log("drawing 7");

    clean('isBarChart')


    svg.select('.genre-chart-x').transition().duration(1400).attr('opacity', 1);
    svg.select('.genre-chart-y').transition().duration(1400).attr('opacity', 1);
    svg.selectAll('.genre-rects')
        .transition()
        .duration(1400)
        .attr("width", d => xGenreScale(d.income))
        .attr('x', d=> xGenreScale(0) )
        .attr('opacity', 1)
        .delay(function(d,i) {
        return(i * 100)
    })

    // simulation
    //     .force('forceX', d3.forceX(d => enrollmentScale(d.Total)))
    //     .force('forceY', d3.forceY(500))
    //     .force('collide', d3.forceCollide(d => enrollmentSizeScale(d.Total) + 2))
    //     .alpha(0.8).alphaDecay(0.05).restart()

    // svg.selectAll('circle')
    //     .transition().duration(300).delay((d, i) => i * 4)
    //     .attr('r', d => enrollmentSizeScale(d.Total))
    //     .attr('fill', d => categoryColorScale(d.Category))

    // //Show enrolment axis (remember to include domain)
    // svg.select('.enrolment-axis').attr('opacity', 0.5).selectAll('.domain').attr('opacity', 1)

}


function draw8(){
    clean('none')
    currentStep = 8;
    console.log("drawing 8");

    // let svg = d3.select('#vis').select('svg')
    // svg.selectAll('circle')
    //     .transition()
    //     .attr('r', d => salarySizeScale(d.Median) * 1.6)
    //     .attr('fill', d => categoryColorScale(d.Category))

    // simulation 
    //     .force('forceX', d3.forceX(500))
    //     .force('forceY', d3.forceY(500))
    //     .force('collide', d3.forceCollide(d => salarySizeScale(d.Median) * 1.6 + 4))
    //     .alpha(0.6).alphaDecay(0.05).restart()
        
}

function draw9(){
    currentStep = 9;
    console.log("drawing 9");
}

//Array of all the graph functions
//Will be called from the scroller functionality

let activationFunctions = [
    draw1,
    draw2,
    draw3,
    draw4,
    draw5, 
    draw6, 
    draw7,
    draw8,
    draw9
]

//All the scrolling function
//Will draw a new graph based on the index provided by the scroll


let scroll = scroller()
    .container(d3.select('#graphic'))
scroll()

let lastIndex, activeIndex = 0

scroll.on('active', function(index){
    d3.selectAll('.step')
        .transition().duration(500)
        .style('opacity', function (d, i) {return i === index ? 1 : 0.1;});
    
    activeIndex = index
    let sign = (activeIndex - lastIndex) < 0 ? -1 : 1; 
    let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(i => {
        activationFunctions[i]();
    })
    lastIndex = activeIndex;

})

scroll.on('progress', function(index, progress){
    if (index == 2 & progress > 0.7){

    }
})