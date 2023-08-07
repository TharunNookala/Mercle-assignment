import Highcharts from 'highcharts'
const engagementHelper = {

    engagementMessageOverTimeChartOptions: function (messageCountList, channels) {
        // return messages;
        const relevantChannels = new Set();
        const dataByChannelAndDate = {};

        // Process messageCountList to gather relevant channels and their message counts by date
        messageCountList.forEach(entry => {
            const channelId = entry.channelId;
            const date = new Date(entry.timeBucket).toISOString().split('T')[0];
            relevantChannels.add(channelId);

            if (!dataByChannelAndDate[channelId]) {
                dataByChannelAndDate[channelId] = {};
            }

            if (!dataByChannelAndDate[channelId][date]) {
                dataByChannelAndDate[channelId][date] = 0;
            }

            dataByChannelAndDate[channelId][date] += parseInt(entry.count);
        });

        const allDates = new Set();
        Object.values(dataByChannelAndDate).forEach(channelData => {
            Object.keys(channelData).forEach(date => {
                allDates.add(date);
            });
        });
        const sortedDates = Array.from(allDates).sort();

        // Create Highcharts series data
        const seriesData = [];
        channels.forEach(channel => {
            const channelId = channel.id;
            if (relevantChannels.has(channelId) && Object.keys(dataByChannelAndDate[channelId]).length > 1) {
                const data = [];
                sortedDates.forEach(date => {
                    const messageCount = dataByChannelAndDate[channelId][date] || 0;
                    data.push({
                        x: new Date(date).getTime(),
                        y: messageCount,
                        channelId: channelId,
                        channelName: channel.name,
                        messageCount: messageCount
                    });
                });
                seriesData.push({
                    name: channel.name,
                    data: data
                });
            }
        });

        // Create the Highcharts options object
        const options = {
            // Highcharts configuration options here
            series: seriesData,
            tooltip: {
                formatter: function () {
                    return `<b>${this.point.channelName}</b><br>${this.point.messageCount} messages on ${Highcharts.dateFormat('%Y-%m-%d', this.x)} `;
                }
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    formatter: function () {
                        const dateIndex = sortedDates.findIndex(date => new Date(date).getTime() === this.value);
                        if (dateIndex !== -1) {
                            const currentDate = new Date(sortedDates[dateIndex]);
                            const prevDate = new Date(sortedDates[dateIndex - 1]);
                            const prevDateFormatted = Highcharts.dateFormat('%d %b', prevDate);
                            const currentDateFormatted = Highcharts.dateFormat('%d %b', currentDate);
                            return prevDateFormatted !== currentDateFormatted ? currentDateFormatted : '';
                        }
                        return '';
                    }
                },
                categories: sortedDates.map(date => new Date(date).getTime())
            },
            // ... other options ...
        };

        return options;
    }
};


export default engagementHelper