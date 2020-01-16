import React from 'react';
import {
    withGoogleMap,
    withScriptjs,
    GoogleMap,
    Marker,
    Polyline,
    DirectionsRenderer,
} from 'react-google-maps'

class Map extends React.Component {
    state = {
        progress: [],
    }

    path = [
        {
            lat: 19.386020,
            lng: -99.157089,
        },

        {
            lat: 19.347576,
            lng: -99.180444
        }
    ];

    velocity = 50;
    initialDate = new Date()

    getDistance = () => {
        // seconds between when the component loaded and now
        const differentInTime = (new Date() - this.initialDate) / 1000 // pass to seconds
        return differentInTime * this.velocity // d = v*t -- thanks Newton!
    }

    componentDidMount = () => {
        this.interval = window.setInterval(this.moveObject, 1000)

        const DirectionsService = new window.google.maps.DirectionsService();

        DirectionsService.route({
            origin: new window.google.maps.LatLng(this.path[0]),
            destination: new window.google.maps.LatLng(this.path[this.path.length - 1]),
            travelMode: window.google.maps.TravelMode.DRIVING,
        }, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
                const overViewCoords = result.routes[0].overview_path;
                this.setState({
                    directions: result,
                    lineCoords: overViewCoords,
                    polylineOptions: window.google.maps.clickable
                });

                console.log(result)

            } else {
                console.error(`error fetching directions ${result}`);
            }
        });
    }

    componentWillUnmount = () => {
        window.clearInterval(this.interval)
    }

    moveObject = () => {
        const distance = this.getDistance()
        if (!distance) {
            return
        }

        let progress = this.path.filter(coordinates => coordinates.distance < distance)

        const nextLine = this.path.find(coordinates => coordinates.distance > distance)
        if (!nextLine) {
            this.setState({ progress })
            return // it's the end!
        }
        const lastLine = progress[progress.length - 1]

        const lastLineLatLng = new window.google.maps.LatLng(
            lastLine.lat,
            lastLine.lng
        )

        const nextLineLatLng = new window.google.maps.LatLng(
            nextLine.lat,
            nextLine.lng
        )

        // distance of this line 
        const totalDistance = nextLine.distance - lastLine.distance
        const percentage = (distance - lastLine.distance) / totalDistance

        const position = window.google.maps.geometry.spherical.interpolate(
            lastLineLatLng,
            nextLineLatLng,
            percentage
        )

        console.log(this.getDistance())

        progress = progress.concat(position)
        this.setState({ progress })
    }

    componentWillMount = () => {
        this.path = this.path.map((coordinates, i, array) => {
            if (i === 0) {
                return { ...coordinates, distance: 0 } // it begins here! 
            }
            const { lat: lat1, lng: lng1 } = coordinates
            const latLong1 = new window.google.maps.LatLng(lat1, lng1)

            const { lat: lat2, lng: lng2 } = array[0]
            const latLong2 = new window.google.maps.LatLng(lat2, lng2)

            // in meters:
            const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                latLong1,
                latLong2
            )

            return { ...coordinates, distance }
        })
        console.log(this.path)
    }

    render = () => {
        return (
            <div>
                <GoogleMap defaultZoom={
                    14
                }
                    mapTypeId={window.google.maps.MapTypeId.ROADMAP}
                    defaultCenter={
                        {
                            lat: 19.366537,
                            lng: -99.167688
                        }
                    }>
                    <DirectionsRenderer overview_path={this.state.path} directions={this.state.directions} draggable={true} panel={document.getElementById('panel')} />

                    <Marker position={this.state.progress[this.state.progress.length - 1]} />
                    <Marker position={this.path[this.path.length - 1]} />
                    <Polyline path={this.state.lineCoords} options={{ strokeColor: "#FF0000 " }} />
                    <div id="panel"></div>
                </GoogleMap>
            </div>
        )
    }
}

const MapComponent = withScriptjs(withGoogleMap(Map))

export default () => (
    < MapComponent googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBiM5Q1EYtkV7CO4Pr4yzt0aXiE86oqTGY&v=3.exp&libraries=geometry,drawing,places"
        loadingElement={< div style={{ height: `100%` }} />} containerElement={<div style={{ height: `550px`, width: '100%' }} />} mapElement={< div style={{ height: `100%` }} />} />)
