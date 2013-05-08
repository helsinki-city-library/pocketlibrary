#!/bin/bash

if [ "$1" != "" ]
then
    LANG=$1
    shift
fi

if [ "$1" != "" ]
then
    BUILDDIR=$1
    shift
fi

if [ "$1" != "" ]
then
    TARGET=$1
    shift
fi

echo Building $TARGET to $BUILDDIR

if [ ! -e $BUILDDIR/lib ]
then
    echo "Creating build dir..."
    mkdir -p $BUILDDIR/lib
    mkdir -p $BUILDDIR/css
    mkdir -p $BUILDDIR/img
    mkdir -p $BUILDDIR/src
fi

cp templates/$LANG/lainari.html $BUILDDIR/index.html
cp -r lib/* $BUILDDIR/lib
cp -r src/* $BUILDDIR/src
cp -r img/* $BUILDDIR/img
cp -r css/style*.css $BUILDDIR/css

sed -i -e "s#=\([ ]*\)'/#=\1'#" $BUILDDIR/index.html
sed -i -e "s/<body/<body class=\"$TARGET\"/" $BUILDDIR/index.html
sed -i -e "s/\/img/img/" $BUILDDIR/src/main.js

if [ "$TARGET" == "android" ]
then
    sed -i -e "s/cordova-2.2.0.js/cordova-2.2.0-$TARGET.js/" $BUILDDIR/index.html
    sed -i -e "s/GoogleAnalyticsPlugin.js/GoogleAnalyticsPlugin-$TARGET.js/" $BUILDDIR/index.html
fi

sed -i -e "s/barcodescanner.js/barcodescanner-$TARGET.js/" $BUILDDIR/index.html
sed -i -e 's/\"\/img\//\"img\//' $BUILDDIR/src/models.js
sed -i -e 's/\"\/img\//\"img\//' $BUILDDIR/src/lang-fi.js
sed -i -e 's/url(\"\//url("..\//' $BUILDDIR/css/style_320.css
sed -i -e 's/url(\"\//url("..\//' $BUILDDIR/css/style_480.css
sed -i -e 's/url(\"\//url("..\//' $BUILDDIR/css/style_360.css
sed -i -e 's/url(\"\//url("..\//' $BUILDDIR/css/style.css
sed -i -e "s/window.device = { platform: \"browser\" };/window.device = { platform: \"$TARGET\" };/" $BUILDDIR/src/main.js 

find $BUILDDIR -name \*-e | xargs rm
 
echo "Done."
