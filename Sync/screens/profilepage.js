import React from 'react'
import { SafeAreaView, Text, TouchableOpacity, StatusBar, DeviceEventEmitter, NativeEventEmitter, View, Button, Image, TextInput } from 'react-native'
import { whole } from '../assets/styles/stylesheet'
import { launchImageLibrary } from 'react-native-image-picker'
import * as Cblite from 'react-native-cblite';

const options = {
    title: 'Select image',
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
    includeBase64: true
};

const CouchbaseNativeModule = Cblite;
const eventEmitter = Cblite.EventsListeners;

export default class Profile extends React.Component {

    static navigationOptions = {
        headerShown: true,

    };

    state = {
        loaded: false,
        syncOn: false,
        UserObject: {},
        replicators: [],
        jsrepListner: "ReplicatorChangeEvent",
        jsqueryListner: "QueryChangeEvent",
        imagepath: require('../assets/img/avatar.png'),
    }

    constructor(props) {
        super(props);
    }

    setUserData = (successResponse) => {

        let result = successResponse;

        if (result != null && result != "Document is null") {

            var userobj = result;

            this.setState({
                UserObject: userobj,
                name: userobj.name,
                address: userobj.address,
                university: userobj.university,
                userobjimage: userobj.image
            });

            if (userobj.image) {
                CouchbaseNativeModule.getBlob(this.state.dbname, JSON.stringify(userobj.image), (imageBlob) => {
                    console.log("Blob fetched.")
                    const encodedBase64 = imageBlob;
                    let imageuri = { uri: `data:${userobj.image.content_type};base64,${encodedBase64}` }
                    this.setState({
                        imagepath: imageuri,
                    });

                }, (errorResponse) => {
                    alert("There was a problem while fetching profile image. Details : " + errorResponse);
                });
            }

        }
    }

    getDocumentOnerrorCallback = (errorResponse) => {
        if (!errorResponse == "Document not found") {
            alert("There was a problem while fetching the user data. Details : " + errorResponse);
        }
    }

    componentDidMount = async () => {

        //setup
        var id = this.props.navigation.state.params.username;
        var replicatorID = this.props.navigation.state.params.ReplicatorID;
        let docId = `user::${id}`;
        let dbName = `userprofile`;

        this.setState({
            email: id,
            docid: docId,
            dbname: dbName,
            ReplicatorID: replicatorID
        }, () => {

            // Add JSlisteners
            eventEmitter.addListener(this.state.jsrepListner, this.OnReplicatorChanged);


            // Add Live Query
            this.setupLiveQuery();
        });




    }


    OnReplicatorChanged = (event) => {
        //event = JSON.parse(event);
        if (event.errorCode && event.errorCode == '10401' && event.status == 'stopped') {
            alert('User is not authorized to sync with remote server. Check credentials and try again.')
        } else if (event.errorCode == '111' && event.status == 'offline') {
            alert('There was an error when attempting to sync with remote server. You can continue to use the app in standalone mode.')
            this.syncStop(false)
        }
        console.log("Replicator Event :", event);
    }

    setupLiveQuery = async () => {

        let queryStr = `SELECT * FROM ${this.state.dbname} WHERE META().id = "${this.state.docid}"`;
        this.setState({ queryStr });

        let queryResponse = await CouchbaseNativeModule.queryWithChangeListener(this.state.dbname, queryStr, this.state.jsqueryListner);
        console.log("Live Query :", queryResponse)

        if (queryResponse == "Success") {
            this.setState({ syncOn: true });
            eventEmitter.addListener(this.state.jsqueryListner, this.onQueryUpdated);
        } else {
            alert("There was an issue while setting up sync")
        }

    }

    onQueryUpdated = (event) => {
        console.log("Query Event :", event);
        let response = JSON.parse(event);
        if (response.length > 0) {
            this.setUserData(response[0].userprofile)
        }
    };

    selectpicture = () => {

        launchImageLibrary(options, (response) => {

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                const source = { uri: response.assets[0].uri };
                let image = response.assets[0].base64;
                let mimagetype = response.assets[0].type;

                // You can also display the image using data:
                this.setState({
                    imagepath: source,
                    imagedata: image,
                    imagetype: mimagetype,
                });

            }
        });

    }

    error_callback = (ErrorResponse) => {
        alert(ErrorResponse)
    }

    saveProfile = () => {

        var data = {};
        data.type = "user";
        data.name = this.state.name;
        data.email = this.state.email;
        data.address = this.state.address;
        data.university = this.state.university;
        data.image = this.state.userobjimage;

        if (this.state.imagedata) {
            let blob = CouchbaseNativeModule.setBlob(this.state.dbname, this.state.imagetype, this.state.imagedata);
            if (blob.length) {
                data.image = JSON.parse(blob);
            }
        }
        data = JSON.stringify(data);
        console.log("User profile data", data);
        CouchbaseNativeModule.setDocument(this.state.dbname, this.state.docid, data, this.OnSetDocSuccess,
            (error) => {
                alert(error);
            });

    }

    OnSetDocSuccess = (result) => {


        if (result == 'Success') {
            this.setState({imagedata: null});
            alert('User Profile Updated');
        }
        else {
            alert('There was a problem while updating the user data. Details : ' + result);
        }

    }

    setuniversity = (name) => {
        this.setState({
            university: name,
        });
    }

    syncStop = async (logout) => {


        if (!this.state.syncOn) {
            this.stopliveQuery();
        }
        else {

            //Stop Replicators
            var ReplicatorStopResposne = await CouchbaseNativeModule.replicatorStop(this.state.dbname, this.state.ReplicatorID);
            console.log("Replicator Stop :", ReplicatorStopResposne);

            if (ReplicatorStopResposne != "Success") {
                alert("Error while logout " + ReplicatorStopResposne)
            } else {

                //Stop Replication Listeners
                let ReplicatorListenerResponse = await CouchbaseNativeModule.replicationRemoveChangeListener(this.state.dbname, this.state.ReplicatorID);
                console.log("Replicator Remove Listener :", ReplicatorListenerResponse);

                if (ReplicatorListenerResponse == "Success") {
                    DeviceEventEmitter.removeAllListeners(this.state.jsrepListner);

                    if (logout)
                        this.stopliveQuery();
                    else
                        this.setState({ syncOn: false })
                }


            }
        }

    }

    stopliveQuery = async () => {
        //Stop Query Listener
        var querylistener = await CouchbaseNativeModule.removeQueryChangeListener(this.state.dbname, this.state.queryStr);
        console.log("Stop Query :", querylistener);

        if (querylistener != "Success")
            alert("Error while logout " + querylistener)
        else {
            DeviceEventEmitter.removeAllListeners(this.state.jsqueryListner);

            //Close DB and Logout
            this.logout();

        }
    }

    logout = () => {

        //close userdb
        CouchbaseNativeModule.closeDatabase(this.state.dbname, (uDBsuccess) => {

            console.log("Close UserDB :", uDBsuccess);
            if (uDBsuccess == "Success") {

                //close universities db
                CouchbaseNativeModule.closeDatabase('universities', (uniDBSuccess) => {

                    if (uniDBSuccess == "Success") {
                        this.props.navigation.goBack();
                    } else {
                        console.log("uniDB close :" + uniDBSuccess);
                    }

                }, (err) => { console.log("uniDB close :" + err); });

            }
            else {
                this.error_callback();
            }
        }, (err) => { console.log("universities " + err); })// this.error_callback);


    }

    render() {
        const { navigate } = this.props.navigation;
        return (

            <SafeAreaView style={whole.container}>

                <StatusBar translucent backgroundColor="transparent" barStyle='dark-content' />

                <View style={whole.verticalLinearLayout}>



                    <View style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>

                        <View>
                            <Image style={whole.profileImage} source={this.state.imagepath}></Image>

                            <Button
                                title="Upload Photo"
                                color="#E62125"
                                style={whole.btnUpload}
                                onPress={this.selectpicture}
                            />

                        </View>

                        <TextInput placeholder="Name" keyboardType='default' onChangeText={(username) => this.setState({ name: username })} style={whole.mtextinput} value={this.state.name} />
                        <TextInput placeholder="Email" editable={false} selectTextOnFocus={false} keyboardType='email-address' onChangeText={(username) => this.setState({ email: username })} style={whole.mtextinput} value={this.state.email} />
                        <TextInput placeholder="Address" keyboardType='default' onChangeText={(username) => this.setState({ address: username })} style={whole.mtextinput} value={this.state.address} />
                        <TouchableOpacity keyboardType='default' style={[whole.mselectinput, { justifyContent: 'space-between', flexDirection: 'row', alignContent: 'center', padding: 10 }]} onPress={() => { navigate("query", { ongoback: this.setuniversity }) }}>
                            <Text numberOfLines={1}>{this.state.university ? this.state.university : "Select University"}</Text><Text style={{ color: '#E62125' }}>{">"}</Text>
                        </TouchableOpacity>
                        <View style={whole.centerLayoutProfile}>
                            <Button
                                title="Logout"
                                color="#888"
                                style={whole.button}
                                onPress={() => this.syncStop(true)} />

                            <Button
                                title="Save"
                                color="#E62125"
                                style={whole.button}
                                onPress={this.saveProfile}
                            />
                        </View>
                    </View>


                </View>




            </SafeAreaView>
        );
    }
}
