# StraySpotter
<p align="center">
  <!-- You can add a project logo here if available -->
  <img src="react-service\public\heart.png" alt="StraySpotter Logo" width="100"/>
  <br />
  <i>An interactive platform for helping stray animals.</i>

## Table of Contents
- [Members](#members)
- [About The Project](#about-the-project)
- [Built With](#built-with)
- [Getting Started](#getting-started)
- [Views](#views)

## Members
- Yetong Chen
- Xin Jin
- Suqi Lu

## About The Project
<!-- A brief description of what the project does and its importance -->
The objective of this project, StraySpotter, is to create a platform allowing users to post and view information about stray animals on an interactive map, facilitating their rescue and care.

## Built With
<!-- A list of technologies used in the project -->
- [![React][React-img]][React-url]
- [![node.js][node.js-img]][node.js-url]
- [![Express.js][Express.js-img]][Express.js-url]
- [![mongodb][mongodb-img]][mongodb-url]
- [![Firebase][Firebase-img]][Firebase-url]
- [![Leaflet][Leaflet-img]][Leaflet-url]

## Getting Started
<!-- Step-by-step guide on how to set up the project locally -->
To get a local copy up and running, follow these steps:

### Prerequisites
- MongoDB
- Node.js

### Installation
1. Clone the repository:
```sh
  git clone https://github.com/yetongchen/StraySpotter.git
```
2. Install NPM packages in data-service:
```sh
  cd data-service
  npm install
  npm start
```
3. Import initial data:
```sh
  cd data-service
  node test/seed.js
```

4. Install NPM packages in react-service:
```sh
cd ../react-service
npm install
npm start
```
5. Accessing the Application
Open http://localhost:3000 in your browser to view the application.

## Views

### Webpage View
<p align="center">
  <img src="react-service\public\webpage_view.png" alt="StraySpotter Webpage View" />
</p>

### Mobile View
<p align="center">
  <img src="react-service\public\mobile_view.png" alt="StraySpotter Mobile View" />
</p>

<!-- Contact information for the project team -->

<!-- Footnotes or additional information -->
<p align="center"><i>Project by Yetong Chen, Xin Jin, Suqi Lu</i></p>


<!-- MARKDOWN LINKS & IMAGES -->

[React-url]: https://react.dev/
[React-img]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[node.js-url]: https://nodejs.org/en
[node.js-img]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[Express.js-url]: https://expressjs.com/
[Express.js-img]: https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&Color=white
[mongodb-url]: https://www.mongodb.com/zh-cn
[mongodb-img]: https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white
[Firebase-url]: https://firebase.google.com/
[Firebase-img]: https://img.shields.io/badge/Firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black
[Leaflet-url]: https://leafletjs.com/
[Leaflet-img]: https://img.shields.io/badge/Leaflet-1EB300?style=for-the-badge&logo=leaflet&logoColor=white