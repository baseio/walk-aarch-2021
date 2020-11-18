// from https://github.com/bazh/subtitles-parser


const SRTParser = {};



SRTParser.process = (data) => {
    const regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;

    data.replace(/\r/g, '');
    data = data.split(regex);
    data.shift();

    const items = [];
    const items2 = {};

    for (var i = 0; i < data.length; i += 4) {
        items.push({
            id: data[i].trim(),
            startTime: SRTParser._time2Ms(data[i + 1]),
            endTime: SRTParser._time2Ms(data[i + 2]),
            text: data[i + 3].trim()
        });

    }

    SRTParser._data = items

    return items;
}

SRTParser.show = (ms) => {
	let nearest = null

	for(let i=0; i<SRTParser._data.length; i++){
		const o = SRTParser._data[i]
		if( o.startTime <= ms  ){
			nearest = o
		}
		if( o.endTime > ms && o.endTime > ms ){
			break;
			// continue;
		}
		console.log(i, ms, o.startTime)
	}
	return nearest

}


SRTParser._time2Ms = (_val) => {
	const val = _val.trim()
    const regex = /(\d+):(\d{2}):(\d{2}),(\d{3})/;
    const parts = regex.exec(val);

    if (parts === null) {
        return 0;
    }

    for (var i = 1; i < 5; i++) {
        parts[i] = parseInt(parts[i], 10);
        if (isNaN(parts[i])) parts[i] = 0;
    }

    // hours + minutes + seconds + ms
    return parts[1] * 3600000 + parts[2] * 60000 + parts[3] * 1000 + parts[4];
}

SRTParser._data = []
