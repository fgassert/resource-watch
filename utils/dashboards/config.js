// Temporarily hard-coded list of dashboards
// Needs to be updated so the widgets can be shared between various
// dashboards instead of copying them.

/* eslint-disable */
export default [
  {
    name: 'Water',
    slug: 'water',
    description: 'Water is vital to the natural and manmade systems of our planet. Understanding global water challenges requires timely, relevant information about the many factors that impact water quantity and quality, the health of freshwater ecosystems, and access to safe water sources.',
    image: 'static/images/dashboards/dashboard-water.jpg',
    widgets: [
      {
        widgetId: '6f01a91e-bb68-4d10-9da4-e48b553193f3',
        categories: ['Water', 'Cities'],
      },
      {
        name: 'Countries that will experience the greatest increase in projected water stress in the year 2040 if we continue business as usual',
        categories: ['Water', 'Society'],
        data: {
          attributes: {
            widgetConfig: {
              "height":300,
              "padding": {"top": 25,"left": 0,"bottom": 30,"right": 0},
              "data": [
                {
                  "name": "table",
                  "url": "https://wri-rw.carto.com/api/v2/sql?q=SELECT country, values, iso, row_number() over (order by values desc) as rank FROM aqueduct_water_stress_country_ranking_bau where type = 'all' and year = '2040' and values!=0 order by values desc",
                  "format": {"type": "json","property": "rows"},
                  "transform": [{"type": "sort","by": "rank"}]
                },
                {
                  "name": "max",
                  "source": "table",
                  "transform": [{"type": "aggregate","summarize": {"rank": ["max"]}}]
                },
                {
                  "name": "head",
                  "source": "table",
                  "transform": [
                    {
                      "type": "cross",
                      "with": "max",
                      "filter": "datum.a.rank===datum.b.max_rank || datum.a.rank<=10"
                    },
                    {"type": "sort","by": "a.rank"} 
                  ]
                }
              ],
              "scales": [
                {
                  "name": "bar",
                  "type": "linear",
                  "range": "width",
                  "domain": {"data": "table","field": "values"}
                },
                {
                  "name": "vertical_head",
                  "type": "ordinal",
                  "range": "height",
                  "domain": {
                    "data": "head",
                    "field": "a.rank"
                  }
                }
              ],
              "marks": [
                {
                  "type": "text",
                  "from": {"data": "head"},
                  "properties": {
                    "enter": {
                      "x": {"value": 20},
                      "y": {"field": "a.rank","scale": "vertical_head"},
                      "text": {
                        "template": "{{datum.a.rank}}.- {{datum.a.country}}"
                      },
                      "baseline": {"value": "middle"},
                      "fontSize": {"value": 13},
                      "fill": {"value": "#555555"},
                      "align": {"value": "left"}
                    }
                  }
                },
                {
                  "name": "head",
                  "type": "rect",
                  "from": {"data": "head"},
                  "properties": {
                    "enter": {
                      "x":{"field": {"group": "width"},"mult": 0.35},
                      "width":{"scale": "bar", "field": "a.values","mult": 0.5},
                      "y": {
                        "field": "a.rank",
                        "scale": "vertical_head",
                        "offset": -6
                      },
                      "height": {"value": 10},
                      "fillOpacity": {"value": 1}
                    }
                  }
                }   
              ]
            }
          }
        }
      },
      {
        widgetId: '04b1610b-74ef-413b-b167-3a0169f77b3f',
        categories: ['Water', 'Food']
      },
      {
        name: '% of power plants exposed to water risk',
        categories: ['Water', 'Energy']
      },
      {
        name: 'Watersheds are at risk due to deforestation',
        categories: ['Water', 'Forests'],
        data: {
          attributes: {
            widgetConfig: {
              "padding": {"top": 0,"left": 0,"right": 0,"bottom": 0},
              "data": [
                {
                  "url": "https://wri-rw.carto.com/api/v2/sql?q=SELECT count(rs_tl_c) x, rs_tl_c as y FROM river_basins where rs_tl_c != 10  group by rs_tl_c",
                  "name": "table",
                  "format": {"type": "json","property": "rows"}
                },
                {
                  "from":"table",
                  "name": "pie",
                  "transform": [{"type": "pie","field": "x"}]
                }
              ],
              "marks": [
                {
                  "from": {
                    "data": "table",
                    "transform": [{"type": "pie","field": "x"}]
                  },
                  "type": "arc",
                  "properties": {
                    "enter": {
                      "x": {"mult": 0.5,"field": {"group": "width"}},
                      "y": {"mult": 0.5,"field": {"group": "height"}},
                      "fill": {"field": "x","scale": "color"},
                      "stroke": {"value": "white"},
                      "endAngle": {"field": "layout_end"},
                      "startAngle": {"field": "layout_start"},
                      "innerRadius": {"value": 45},
                      "outerRadius": {"value": 65}
                    }
                  }
                }
              ],
              "scales": [
                {
                  "name": "color",
                  "type": "ordinal",
                  "range": "category20c",
                  "domain": {"data": "table","field": "x_percent"}
                }
              ]
            }
          }
        }
      },
      {
        widgetId: '2528cfdb-fd03-4965-bf77-3550a43b5055',
        categories: ['Water', 'Forests']
      },
      {
        widgetId: '73c574b9-f9ab-4f77-87be-651ff8dac5fe',
        categories: ['Water', 'Biodiversity', 'Climate']
      },
      {
        widgetId: '7cdad4dc-0074-4bd4-b3bd-db6ffc4e0180',
        categories: ['Water', 'Disasters', 'Society'],
      },
      {
        name: 'Surface water is changing over time',
        categories: ['Water']
      }
    ]
  },
  /* The following dashboard is not a real one, but instead a link to the old
   * country dashboard */
  {
    name: 'Countries',
    slug: 'countries',
    image: 'static/images/dashboards/dashboard-Cities.jpg',
    widgets: [{}]
  },
  {
    name: 'Cities',
    slug: 'cities',
    description: '',
    image: 'static/images/dashboards/dashboard-Cities.jpg',
    widgets: []
  },
  {
    name: 'Society',
    slug: 'society',
    description: '',
    image: 'static/images/dashboards/dashboard-Society.jpg',
    widgets: []
  },
  {
    name: 'Food',
    slug: 'food',
    description: '',
    image: 'static/images/dashboards/dashboard-Food.jpg',
    widgets: []
  },
  {
    name: 'Energy',
    slug: 'energy',
    description: '',
    image: 'static/images/dashboards/dashboard-Energy.jpg',
    widgets: []
  },
  {
    name: 'Forests',
    slug: 'forests',
    description: '',
    image: 'static/images/dashboards/dashboard-Forests.jpg',
    widgets: []
  },
  {
    name: 'Biodiversity',
    slug: 'biodiversity',
    description: '',
    image: 'static/images/dashboards/dashboard-Biodiversity.jpg',
    widgets: []
  },
  {
    name: 'Climate',
    slug: 'climate',
    description: '',
    image: 'static/images/dashboards/dashboard-Climate.jpg',
    widgets: []
  },
  {
    name: 'Disasters',
    slug: 'disasters',
    description: '',
    image: 'static/images/dashboards/dashboard-Disasters.jpg',
    widgets: []
  }
];
/* eslint-enable */
