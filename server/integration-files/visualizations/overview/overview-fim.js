/*
 * Wazuh app - Module for Overview/FIM visualizations
 * Copyright (C) 2015-2019 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
export default [
  {
    _id: 'Wazuh-App-Overview-FIM-Events-summary',
    _type: 'visualization',
    _source: {
      title: 'Events summary',
      visState:
        '{"title":"Events summary","type":"line","params":{"type":"line","grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Alerts"}}],"seriesParams":[{"show":"true","type":"line","mode":"normal","data":{"label":"Alerts","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Alerts"}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"@timestamp"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Overview-FIM-Top-5-rules',
    _type: 'visualization',
    _source: {
      title: 'Top 5 rules',
      visState:
        '{"title":"Export rule distr","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"sum","schema":"metric","params":{"field":"rule.level"}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"rule.description","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Overview-FIM-Top-5-agents-pie',
    _type: 'visualization',
    _source: {
      title: 'Top 5 agents pie',
      visState:
        '{"title":"Top 5 agents pie","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"agent.name","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"language":"lucene","query":""},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Overview-FIM-Common-actions',
    _type: 'visualization',
    _source: {
      title: 'Common actions',
      visState:
        '{"title":"Common actions","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":false,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"syscheck.event","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"language":"lucene","query":""},"filter":[]}'
      }
    }
  },
  {
    _id: 'Wazuh-App-Agents-FIM-Alerts-by-action-over-time',
    _source: {
      title: 'Alerts by action over time',
      visState:
        '{"title":"Alerts by action over time","type":"metrics","params":{"id":"61ca57f0-469d-11e7-af02-69e470af7417","type":"timeseries","series":[{"id":"0eba6ef0-41a1-11e9-b2ca-a3f8ee4d0e71","color":"rgba(0,156,224,1)","split_mode":"terms","metrics":[{"id":"0eba6ef1-41a1-11e9-b2ca-a3f8ee4d0e71","type":"count"}],"separate_axis":0,"axis_position":"right","split_color_mode":"rainbow","formatter":"number","chart_type":"line","line_width":1,"point_size":1,"fill":0.9,"stacked":"stacked","terms_field":"syscheck.event","terms_size":"10"}],"time_field":"@timestamp","index_pattern":"wazuh-alerts","interval":"auto","axis_position":"left","axis_formatter":"number","axis_scale":"normal","show_legend":1,"show_grid":1,"legend_position":"left"},"aggs":[]}',
      uiStateJSON: '{}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON: `{ "index":"wazuh-alerts", "filter":[], "query":{"query":"","language":"lucene"} }`
      }
    },
    _type: 'visualization'
  },
  {
    _id: 'Wazuh-App-Overview-FIM-top-agents-user',
    _type: 'visualization',
    _source: {
      title: 'Top users',
      visState:
        '{"title":"Top users","type":"table","params":{"perPage":10,"showPartialRows":false,"showMetricsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"agent.id","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Agent ID"}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"agent.name","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Agent name"}},{"id":"4","enabled":true,"type":"terms","schema":"bucket","params":{"field":"syscheck.uname_after","size":1,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Top user"}}]}',
      uiStateJSON:
        '{"vis":{"params":{"sort":{"columnIndex":null,"direction":null}}}}',
      description: '',
      version: 1,
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"index":"wazuh-alerts","query":{"query":"","language":"lucene"},"filter":[{"meta":{"index":"wazuh-alerts","negate":false,"disabled":false,"alias":null,"type":"phrase","key":"rule.groups","value":"syscheck","params":{"query":"syscheck","type":"phrase"}},"query":{"match":{"rule.groups":{"query":"syscheck","type":"phrase"}}},"$state":{"store":"appState"}}]}'
      }
    }
  }
];
