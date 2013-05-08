#!/bin/bash

convert() {
    extension=$1
    new_extension=$2
    for f in `find . -name \*.$extension`; do
        basename=`dirname $f`/`basename $f .$extension`
        haml_file="$basename.$extension";
        html_file="$basename.$new_extension";
        if [ -e "$html_file" -a ! "$all" ]; then
            if [ "$haml_file" -ot "$html_file" ]; then
                continue
            fi
        fi
        echo -n "Converting $haml_file..."
        if [ `which $extension` ];
        then
            $extension $haml_file $html_file
        else
            $3 $haml_file $html_file 
        fi
        if [ $? -eq 0 ]; then
            echo " done"
        else
            echo " FAIL"
            exit 1
        fi
    done
}

EXT_FLAG=$1

if [ "$1" == "--all" ]; then
    all="true"
    EXT_FLAG=$2
fi

if [ "$EXT_FLAG" == "*.haml" -o "$EXT_FLAG" == "" ]; then
convert haml html
haml templates/fi/lainari.haml templates/fi/lainari.html
haml templates/en/lainari.haml templates/en/lainari.html
haml templates/sv/lainari.haml templates/sv/lainari.html
fi

if [ "$EXT_FLAG" == "*.mustache" -o "$EXT_FLAG" == "" ]; then
convert haml.mustache ms haml
fi

if [ "$EXT_FLAG" == "*.scss" -o "$EXT_FLAG" == "" ]; then
sass css/style_320.scss css/style_320.css
sass css/style_480.scss css/style_480.css
sass css/style_360.scss css/style_360.css
fi
# Assume there is a conversion program with the same name
# the extension is
