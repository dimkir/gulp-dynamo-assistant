'use strict';

const 
  _               = require('lodash'),
  through         = require('through2'),
  gutil           = require('gulp-util'),
  { Marshaller  }     = require('@aws/dynamodb-auto-marshaller'),
  marshaler       = new Marshaller(),
  { PluginError } = gutil,
  pckg = require('./package.json')
;
const PLUGIN_NAME = pckg.name;

module.exports = gulpDynamoEvents;

function _transformDynamoRecords(opt, inputString){

    let event = JSON.parse(inputString);

    let Records = event.Records.map((rec)=>{

        let r = {
            eventName: rec.eventName,
        };

        let dynamodb = transformDynamoDb(rec.dynamodb);
        r = opt.flatten ? Object.assign(r, dynamodb) : Object.assign(r, { dynamodb });
        return r;
    });


    return JSON.stringify({ Records }, null, 2);

    function transformDynamoDb(dynamodb){
        const { NewImage, OldImage } = dynamodb;
        return {
            NewImage: NewImage ? marshaler.unmarshallItem(NewImage): NewImage,
            OldImage: OldImage ? marshaler.unmarshallItem(OldImage): OldImage,
        }
    }
}

function gulpDynamoEvents(opt){
    console.log(`opt: `, opt);
    const defaults = {
        // caseType: 'lowercase', //  'uppercase'
    }

    
    opt = Object.assign(defaults, opt || {})
    
    // const allowed = ['lowercase', 'uppercase'];
    // if (  !_.includes(allowed, opt.caseType) ){
    //     throw new Error(`Supplied unknown .caseType parameter [${opt.caseType}]. Allowed: [${allowed.join(',')}]`);
    // } 


    return through.obj(function(file, enc, callback){

        // console.log(JSON.stringify(file, null, 2));
        let isBuffer = false,
            inputString = null, 
            result = null, 
            outBuffer = null;
        
            // Empty file and directory not supported
            if ( file === null || file.isDirectory() ){
                this.push(file);
                return callback();
            }

            isBuffer = file.isBuffer();
            if ( !isBuffer ) {
                let err = new PluginError(PLUGIN_NAME, 'Only Buffer format is supported');
                this.emit('error', err);
                return callback();
            }

            // do the job
            inputString = new String(file.contents);
            try{
                result = _transformDynamoRecords(opt, inputString);
            }
            catch(e){
                let err = new PluginError(PLUGIN_NAME, e);
                this.emit('error', err);
                return callback();
            }
            outBuffer = new Buffer(result);
            let aFile = new gutil.File();
            aFile.path = file.path;
            aFile.base = file.base;
            aFile.contents = outBuffer;
            return callback(null, aFile);


    });

}
