# SpeedPerception

Overview
We describe here the steps involved in creating a UI that allows people to compare webpage loading process between two webpages, and get their input on which one they think loads faster. 

Clearly, no one likes slow webpages. We want to create a free open-source benchmark dataset to advance the systematic study of how human beings perceive webpage loading process, and the above-fold rendering in particular. The web performance field needs a systematic way to compare algorithms and metrics on a standardized dataset of webpage loading videos. Our belief is that such a benchmark would provide a quantitative basis to compare different algorithms and spur computer scientists to make progress on helping quantify perceived webpage performance.

Experimental Design
********************

-- Data Collection
300+ URLs from IR500 list were tested on WPT (WebPageTest)
Videos were generated from WPT filmstip 
HARs were collected along with each video 
Fixed browser and connection type (Cable, Chrome)

-- Video Pairs Selection
In order to compare between pairs, we need to pay attention on Visual Complete because both SI and PSI’s implementation are sensitive to the time frame of a video, which we only select video pairs within 5% of visual complete difference.. 

Difference is calculated as:
diff(a1, a2) = (a1 - a2) / [(a1 + a2)/2]

Within 5% difference, we subgroup them based on 4 conditions of SI difference:
1 <= si_diff < 10
si_diff >= 10
-10 < si_diff <=- 1
si_diff <=- 10
WIthin each SI difference condition, we subgroup each of them into 4 conditions of PSI difference:
psi_diff >= 10
1 <= psi_diff < 10
-10 < psi_diff <= -1
psi_diff <= -10

In total, we have 4 * 4 = 16 conditions for pair selection.

Code (WebApp)
**************

Webapp were developed under Meteor JS framework. 

To install meteor:

curl https://install.meteor.com | sh

Checkout and go to webapp/

meteor

App live on localhost:3000

