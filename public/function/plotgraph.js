function plottime(data) {
    let datatime = data.map((arr) => {
        return arr.time;
    })
    return datatime;
}

function plotgraph(data, position) {
    let datagraph = data.map((arr) => {
        return arr.data[position];
    })
    return datagraph;
}

function plotmap(data, position, lalong) {
    let datamap = data.map((arr) => {
        return arr.data[position].split(",")[lalong];
    })
    return datamap;
}

function intplotmap(data, position, lalong) {
    let datamap = data.map((arr) => {
        return parseInt(arr.data[position].split(",")[lalong]);
    })
    return datamap;
}

function sumarray(a, b) {
    return a + b;
}