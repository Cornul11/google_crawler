const {
    exec
} = require("child_process");

function main() {
    if (process.argv[2] === "csv" || process.argv[2] == null) {
        exec('mongoexport --db app_data --collection apps --fields "docid,backendDocid,docType,backendId,title,creator,descriptionHtml,offer,availability,image,child,containerMetadata,details,aggregateRating,annotations,detailsUrl,shareUrl,reviewsUrl,backendUrl,purchaseDetailsUrl,detailsReusable,subtitle,translatedDescriptionHtml,productDetails,mature,promotionalDescription,availabileForPreregistration,tip,snippetsUrl,forceShareability,useWishlistAsPrimaryAction,downloadSize,signature,downloadUrl,additionalFile,downloadAuthCookie,forwardLocked,refundTimeout,serverInitiated,postInstallRefundWindowMillis,immediateStartNeeded,patchData,encryptionParams,gzippedDownloadUrl,gzippedDownloadSize,splitDeliveryData,installLocation" --type=csv --out export.csv', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(stdout);
            console.log(stderr);
        });
    } else if (process.argv[2] === "json") {
        exec('mongoexport --db app_data --collection apps --out export.json', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(stdout);
            console.log(stderr);
        });
    }
}

main();
