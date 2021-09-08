import React from 'react'
import { SafeAreaView,Text,TouchableOpacity,StatusBar,DeviceEventEmitter,View,Button,Image,TextInput } from 'react-native'
import { whole } from '../assets/styles/stylesheet'
import { launchImageLibrary } from 'react-native-image-picker'
import CbliteAndroid from 'react-native-cblite'

const options = {
    title: 'Select image',
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
    includeBase64: true
};

const CouchbaseNativeModule = CbliteAndroid;

export default class Profile extends React.Component {

    static navigationOptions = {
        headerShown: true,

    };

    state = {
        loaded: false,
        UserObject: {},
        imagepath: require('../assets/img/avatar.png'),
    }

    constructor(props) {
        super(props);
    }

    getDocumentOnsuccessCallback = (successResponse) => {

        let result = successResponse;
        console.log("getDoc : ", result);


        if (result != null && result != "Document is null") {

            var userobj = JSON.parse(result);

            this.setState({
                UserObject: userobj,
                name: userobj.name,
                address: userobj.address,
            });

            if (userobj.image) {

                CouchbaseNativeModule.getBlob(this.state.dbname, userobj.image, (imageBlob) => {

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
            alert("There was a problem while fetching the data. Details : " + errorResponse);
        }
    }

    componentDidMount = () => {

        //setup
        var id = this.props.navigation.state.params.username;
        let docId = `user::<${id}>`;
        let dbName = `userprofile`;

        this.setState({
            email: id,
            docid: docId,
            dbname: dbName
        });

        CouchbaseNativeModule.getDocument(dbName, docId, this.getDocumentOnsuccessCallback, this.getDocumentOnerrorCallback);


        //add listeners
        var jsListner = "DatabaseChangeEvent";
        var x = CouchbaseNativeModule.addDatabaseChangeListener(dbName, jsListner);
        console.log("Add Listner :", x);
        if (x == "Success") {
            //start listening
            DeviceEventEmitter.addListener(jsListner, this.onDbchange);
        }


    }

    onDbchange = (event) => {
        if (event.Modified) {
            var docIds = Object.keys(event.Modified);
            var docs = Object.values(event.Modified);
            // console.warn("Event", "Modified");
            // console.warn("Docid", docIds[0]);
            // console.warn("Doc", docs[0]);
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
                let _imagetype = response.assets[0].type;
                //  console.log(image,imagetype)
                // You can also display the image using data:
                this.setState({
                    imagepath: source,
                    imagedata: image,
                    imagetype: _imagetype,
                });

            }
        });

    }

    saveProfile = () => {

        var data = this.state.UserObject;
        data.type = "user";
        data.name = this.state.name;
        data.address = this.state.address;

        if (this.state.imagedata) {
            let blob = CouchbaseNativeModule.setBlob(this.state.dbname, this.state.imagetype, this.state.imagedata);
            if (blob.length) {
                data.image = blob;
            }
        }
        CouchbaseNativeModule.setDocument(this.state.dbname, this.state.docid, JSON.stringify(data), this.OnSetDocSuccess,
            (error) => {
                alert(error);
            });

    }


    OnSetDocSuccess = (result) => {

        if (result == 'Success') {
            alert('Document saved successfully.');
        }
        else {
            alert('There was a problem while saving the data. Details : ' + result);
        }

    }




    logout = () => {

        //remove listners
        var removeListnerResponse = CouchbaseNativeModule.removeDatabaseChangeListener(this.state.dbname);
        if (removeListnerResponse == "Success") {

            //stop listeneing
            DeviceEventEmitter.removeAllListeners('OnDatabaseChange');
            let closeMainDB = CouchbaseNativeModule.closeDatabase(this.state.dbname);
            let closeUniDB = CouchbaseNativeModule.closeDatabase('universities');
            this.props.navigation.goBack();

        }


    }

    render() {
            const {navigate} = this.props.navigation;
        return (

            <SafeAreaView style={whole.container}>

                <StatusBar translucent backgroundColor="transparent" barStyle='dark-content' />

                <View style={whole.verticalLinearLayout}>

                    <View>
                        <Image style={whole.profileImage} source={this.state.imagepath}></Image>

                        <Button
                            title="Upload Photo"
                            color="#E62125"
                            style={whole.btnUpload}
                            onPress={this.selectpicture}
                        />

                    </View>

                    <View>
                        <TextInput placeholder="Name" keyboardType='default' onChangeText={(username) => this.setState({ name: username })} style={whole.mtextinput} value={this.state.name} />
                        <TextInput placeholder="Email" editable={false} selectTextOnFocus={false} keyboardType='email-address' onChangeText={(username) => this.setState({ email: username })} style={whole.mtextinput} value={this.state.email} />
                        <TextInput placeholder="Address" keyboardType='default' onChangeText={(username) => this.setState({ address: username })} style={whole.mtextinput} value={this.state.address} />
                        <TouchableOpacity keyboardType='default'  style={[whole.mselectinput,{justifyContent:'space-between',flexDirection:'row',alignContent:'center',padding:10}]} onPress={()=>{navigate("query")}}><Text>University</Text><Text>{">"}</Text></TouchableOpacity>
                    </View>

                    <View style={whole.centerLayoutProfile}>
                        <Button
                            title="Logout"
                            color="#E62125"
                            style={whole.button}
                            onPress={this.logout} />

                        <Button
                            title="Save"
                            color="#888"
                            style={whole.button}
                            onPress={this.saveProfile}
                        />
                    </View>
                </View>




            </SafeAreaView>
        );
    }
}
