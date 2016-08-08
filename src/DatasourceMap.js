var base = 'data/';
var globalDatasourceMap = {
    sampleGeoData: {
        url: base + 'Preprocessed-CTSA institutions table_upd-6000071673158844912.csv.cishelltable.json'
    },
    authors: {
        url: base + 'vis2q1a_authors.json'
    },
    mesh: {
        url: base + 'vis2qX1_mesh.json'
    },
    keywords: {
        url: base + 'vis2qX2_keywords.json'
    },
    newpubs: {
        url: base + 'Preprocessed-vis2q1_pubs-1027064089831976069.csv.cishelltable.json'
    },
    newawards: {
        url: base + 'Preprocessed-vis2q2_awards-1052289289739730454.csv.cishelltable.json'
    },
    newtrials: {
        url: base + 'Preprocessed-vis2q3_trials-2234683690091300970.csv.cishelltable.json'
    },
    newdata: {
        url: base + 'Preprocessed-microbiome-5233743587409200098.csv.cishelltable.json'
    },
    twitterLatest: {
        url: base + 'IAI-Twitter-F1-Geph-DWC2removed-UWI2removed-F2-Degree2removed.graphml.cishellgraph-cleaned.json'
    },
    solrTrials: {
        url: 'http://ec2-52-38-237-192.us-west-2.compute.amazonaws.com/solr/ctrial/select?q=title_t:%q&wt=%wt&indent=%indent',
        defaults: {
            'q': 'null',
            'wt': 'json',
            'indent': 'true'
        },
        isSolr: true,
        set: 'trials'
    },
    solrPublications: {
        url: 'http://ec2-52-38-237-192.us-west-2.compute.amazonaws.com/solr/pubmed/select?q=%q&wt=%wt&indent=%indent',
        defaults: {
            'q': 'null',
            'wt': 'json',
            'indent': 'true'
        },
        isSolr: true,
        set: 'publications'
    },
    master: {
        url: 'http://ec2-52-38-237-192.us-west-2.compute.amazonaws.com/solr/',
        pubs: 'pubmed/select?q=%q&wt=%wt&indent=%indent',
        trials: 'ctrial/select?q=title_t:%q&wt=%wt&indent=%indent',
        awards: 'award/select?q=title_t:%q&wt=%wt&indent=%indent',
        awardsFromPubs: 'award/select?q=title_t:%q&wt=%wt&indent=%indent',
        pubsFromAwards: 'pubmed/select?q=%q&wt=%wt&indent=%indent',
        default: {
            'q': 'null',
            'wt': 'json',
            'indent': 'true'
        }
    }
}
