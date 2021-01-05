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

