const 
  appRootDir = require('app-root-dir').get(),
  path = require('path'),
  gulp = require('gulp'),
  gulpLog  = require('gulp-log'),
  gulpDynamo = require('../index')
  
;
const eventsSrc = path.join(appRootDir,  '.assets/dynamo/events/*.json');
const eventsDest = path.join(appRootDir, '.tmp/dynamo/short');

gulp.task('dynamo:events', ()=>{

    
    return gulp.src([eventsSrc])
            .pipe(gulpLog())
            // .pipe(gulp.dest('out/'))
            .pipe(gulpDynamo({ 
                flatten: true // flattens .dynamodb 
            }))
            .pipe(gulpLog())
            .pipe(gulp.dest(eventsDest))

            ;
})


gulp.task('watch', gulp.series('dynamo:events', (done)=>{

    console.log(`Watching: \n${eventsSrc}`)
    gulp.watch(eventsSrc, gulp.series('dynamo:events'))


}));




gulp.task('text', ()=>{

    return gulp.src(['in/**/*.txt'])
            .pipe(gulpLog())
            // .pipe(gulp.dest('out/'))
            .pipe(gulpDynamo({ caseType: 'lowercase' }))
            .pipe(gulpLog())
            .pipe(gulp.dest('out/'))

            ;
})


gulp.task('default', gulp.series('watch'));
