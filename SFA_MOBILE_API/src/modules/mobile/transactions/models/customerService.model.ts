import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { nullable, required } from '../../../../shared/utils/commonUtils';
/** Inserts or updates a customer created or changed on the mobile device. */
export async function saveCustomerMaster(connection: PoolConnection, item: Record<string, any>): Promise<boolean> {
    const params = {
        customercode: required(item.customercode),
        type: required(item.type),
        headofficecode: required(item.headofficecode),
        routecode: required(item.routecode),
        streetcode: required(item.streetcode),
        districtcode: required(item.districtcode),
        locationcode: required(item.locationcode),
        customersequence: required(item.customersequence),
        customername: nullable(item.customername),
        customeraddress1: nullable(item.customeraddress1),
        customeraddress2: nullable(item.customeraddress2),
        customerphone: nullable(item.customerphone),
        balance: nullable(item.balance),
        customercategory: nullable(item.customercategory),
        pricingkey: nullable(item.pricingkey),
        promotionkey: Number(item.promotionkey ?? 0) === 0 ? null : nullable(item.promotionkey),
        authorizeditemgrpkey: nullable(item.authorizeditemgrpkey),
        messagekey1: nullable(item.messagekey1),
        messagekey2: nullable(item.messagekey2),
        invoicepaymentterms: nullable(item.invoicepaymentterms),
        invoiceretailoption: nullable(item.invoiceretailoption),
        invoicepriceoverride: nullable(item.invoicepriceoverride),
        invoiceretailoverride: nullable(item.invoiceretailoverride),
        invoiceformatoption: nullable(item.invoiceformatoption),
        invoiceextensionopt: nullable(item.invoiceextensionopt),
        invoicedsdpromptopt: nullable(item.invoicedsdpromptopt),
        invoicecopies: nullable(item.invoicecopies),
        salesinputoprion: nullable(item.salesinputoprion),
        returnsinputoption: nullable(item.returnsinputoption),
        invoiceinputstyle: nullable(item.invoiceinputstyle),
        onhandspromptopt: nullable(item.onhandspromptopt),
        inventoryselectopt: nullable(item.inventoryselectopt),
        invencontaineropt: nullable(item.invencontaineropt),
        queuedreportoption: nullable(item.queuedreportoption),
        surveykey: nullable(item.surveykey),
        contactname: nullable(item.contactname),
        customertype: nullable(item.customertype),
        callfrequency: nullable(item.callfrequency),
        routenumber: nullable(item.routenumber),
        arbcustomernameshort: nullable(item.arbcustomernameshort),
        arbcustomername: nullable(item.arbcustomername),
        arbcustomeraddress1: nullable(item.arbcustomeraddress1),
        arbcustomeraddress2: nullable(item.arbcustomeraddress2),
        hhccustomernameshort: nullable(item.hhccustomernameshort),
        hhccustomername: nullable(item.hhccustomername),
        hhccustomeraddress1: nullable(item.hhccustomeraddress1),
        hhccustomeraddress2: nullable(item.hhccustomeraddress2),
        allowbeyondlimit: nullable(item.allowbeyondlimit),
        tclimit: nullable(item.tclimit),
        activecustomer: nullable(item.activecustomer),
        creditlimitdays: nullable(item.creditlimitdays),
        created: nullable(item.created),
        cdat: nullable(item.cdat),
        modified: nullable(item.modified),
        mdat: nullable(item.mdat),
        forcehand: nullable(item.forcehand),
        renteddisplay: nullable(item.renteddisplay),
        installedchiller: nullable(item.installedchiller),
        monthlydepreciation: nullable(item.monthlydepreciation),
        typeofgiveaway: nullable(item.typeofgiveaway),
        giveawayflag: nullable(item.giveawayflag),
        lastvisiteddate: nullable(item.lastvisiteddate),
        memo1: nullable(item.memo1),
        memo2: nullable(item.memo2),
        tcsubtype: nullable(item.tcsubtype),
        rentperc: nullable(item.rentperc),
        customeraddress3: nullable(item.customeraddress3),
        customercity: nullable(item.customercity),
        customerstate: nullable(item.customerstate),
        customerzip: nullable(item.customerzip),
        authorizeditemlistctl: nullable(item.authorizeditemlistctl),
        invoicepriceprint: nullable(item.invoicepriceprint),
        messagekey3: nullable(item.messagekey3),
        messagekey4: nullable(item.messagekey4),
        messagekey5: nullable(item.messagekey5),
        messagekey6: nullable(item.messagekey6),
        orderformat: nullable(item.orderformat),
        enableupcprint: nullable(item.enableupcprint),
        enabledelayprint: nullable(item.enabledelayprint),
        printsequence: nullable(item.printsequence),
        enablepriceeditinvs: nullable(item.enablepriceeditinvs),
        enablesellprevious: nullable(item.enablesellprevious),
        enablesuggestsales: nullable(item.enablesuggestsales),
        enableautofillreturns: nullable(item.enableautofillreturns),
        enableautofilldamaged: nullable(item.enableautofilldamaged),
        enablesigcapture: nullable(item.enablesigcapture),
        enablereturnstrxn: nullable(item.enablereturnstrxn),
        enableexchangetrxn: nullable(item.enableexchangetrxn),
        enabledamagedreturns: nullable(item.enabledamagedreturns),
        enablearcollection: nullable(item.enablearcollection),
        enablesurveyaudit: nullable(item.enablesurveyaudit),
        enabledelivinstruct: nullable(item.enabledelivinstruct),
        enableinvoicecomment: nullable(item.enableinvoicecomment),
        invoicedetailentry: nullable(item.invoicedetailentry),
        orderdetailentry: nullable(item.orderdetailentry),
        forcestockcapture: nullable(item.forcestockcapture),
        enablepromotrxn: nullable(item.enablepromotrxn),
        alternatecode: nullable(item.alternatecode),
        creditlimit: nullable(item.creditlimit),
        allowcashoncreditexceed: nullable(item.allowcashoncreditexceed),
        arbcustomeraddress3: nullable(item.arbcustomeraddress3),
        templateindicator: nullable(item.templateindicator),
        templatename: nullable(item.templatename),
        arbcontactname: nullable(item.arbcontactname),
        printlanguageflag: nullable(item.printlanguageflag),
        quantumno: nullable(item.quantumno),
        lostplacementdelivs: nullable(item.lostplacementdelivs),
        newplacementdelivs: nullable(item.newplacementdelivs),
        currencycode: nullable(item.currencycode),
        histmaxdeliveries: nullable(item.histmaxdeliveries),
        arcustomertype: nullable(item.arcustomertype),
        custtaxkey1: nullable(item.custtaxkey1),
        custtaxkey2: nullable(item.custtaxkey2),
        custtaxkey3: nullable(item.custtaxkey3),
        customertaxid: nullable(item.customertaxid),
        customertaxidoptions: nullable(item.customertaxidoptions),
        outletsubtype: nullable(item.outletsubtype),
        volume: nullable(item.volume),
        enablegovtaxnote: nullable(item.enablegovtaxnote),
        forwardcoverfactor: nullable(item.forwardcoverfactor),
        enablepromoeditinvs: nullable(item.enablepromoeditinvs),
        enableaddlpromoinvs: nullable(item.enableaddlpromoinvs),
        badcreditcustomer: nullable(item.badcreditcustomer),
        enableduplicateprinting: nullable(item.enableduplicateprinting),
        numoutstandinginv: nullable(item.numoutstandinginv),
        enablefocprinting: nullable(item.enablefocprinting),
        promooptions: nullable(item.promooptions),
        groupcode: nullable(item.groupcode),
        forceposcheck: nullable(item.forceposcheck),
        ancustomercode: nullable(item.ancustomercode),
        printoutletitemcode: nullable(item.printoutletitemcode),
        reportprintcontrol: nullable(item.reportprintcontrol),
        invoicelimiter: nullable(item.invoicelimiter),
        exclusiveopmode: nullable(item.exclusiveopmode),
        returnpromotionkey: nullable(item.returnpromotionkey),
        invoiceformat: nullable(item.invoiceformat),
        liquorlicprint: nullable(item.liquorlicprint),
        enablepromoeditords: nullable(item.enablepromoeditords),
        enableaddlpromoords: nullable(item.enableaddlpromoords),
        enableaddlpromoinvoices: nullable(item.enableaddlpromoinvoices),
        enableposequipment: nullable(item.enableposequipment),
        enablesalestrxn: nullable(item.enablesalestrxn),
        enableadvancepayment: nullable(item.enableadvancepayment),
        printcheckdetails: nullable(item.printcheckdetails),
        tcspecialdiscount: nullable(item.tcspecialdiscount),
        spldiscountdays: nullable(item.spldiscountdays),
        arabiccustomercity: nullable(item.arabiccustomercity),
        threshholdlimit: nullable(item.threshholdlimit),
        discountkey: nullable(item.discountkey),
        enforcepromotion: nullable(item.enforcepromotion),
        gpcustcode: nullable(item.gpcustcode),
        cashonlypromo: nullable(item.cashonlypromo),
        roundnetamount: nullable(item.roundnetamount),
        partialcollection: nullable(item.partialcollection),
        transactiontype: nullable(item.transactiontype),
        enabledraftcopy: nullable(item.enabledraftcopy),
        enablebuybackfree: nullable(item.enablebuybackfree),
        enablecpd: nullable(item.enablecpd),
        enablepaymentsel: nullable(item.enablepaymentsel),
        gpsdata: nullable(item.gpsdata),
        fixedlatitude: nullable(item.fixedlatitude),
        fixedlongitude: nullable(item.fixedlongitude),
        rentkey: nullable(item.rentkey),
        startdate: nullable(item.startdate),
        enddate: nullable(item.enddate),
        definitionvalue: nullable(item.definitionvalue),
        runningvalue: nullable(item.runningvalue),
        rentcontrol: nullable(item.rentcontrol),
        disablebalanceupdate: nullable(item.disablebalanceupdate),
        enablecreditlimit: nullable(item.enablecreditlimit),
        autosettlecollection: nullable(item.autosettlecollection),
        enableinvoicecopy: nullable(item.enableinvoicecopy),
        pobox: nullable(item.pobox),
        shoptelephonenumber: nullable(item.shoptelephonenumber),
        shopfaxnumber: nullable(item.shopfaxnumber),
        ownername: nullable(item.ownername),
        ownerlandlinenumber: nullable(item.ownerlandlinenumber),
        ownermobilenumber: nullable(item.ownermobilenumber),
        contactpersonlandlinenumber: nullable(item.contactpersonlandlinenumber),
        contactpersonmobilenumber: nullable(item.contactpersonmobilenumber),
        contactpersonemail: nullable(item.contactpersonemail),
        purchasemanagername: nullable(item.purchasemanagername),
        purchasemanagerlandlinenumber: nullable(item.purchasemanagerlandlinenumber),
        purchasemanagermobilenumber: nullable(item.purchasemanagermobilenumber),
        purchasemanageremail: nullable(item.purchasemanageremail),
        warehousemanagername: nullable(item.warehousemanagername),
        warehousemanagerlandlinenumber: nullable(item.warehousemanagerlandlinenumber),
        warehousemanagermobilenumber: nullable(item.warehousemanagermobilenumber),
        warehousemanageremail: nullable(item.warehousemanageremail),
        expirylimit: nullable(item.expirylimit),
        exprunningvalue: nullable(item.exprunningvalue),
        distributionkey: nullable(item.distributionkey),
        gpssavecount: nullable(item.gpssavecount),
        graceperiod: nullable(item.graceperiod),
        reportcustcode: nullable(item.reportcustcode),
        enablerental: nullable(item.enablerental),
        enableautofillsales: nullable(item.enableautofillsales),
        enablebatchselection: nullable(item.enablebatchselection)
    };

    const [rows] = await connection.execute<(RowDataPacket & {
        count: number;
    })[]>(`
      SELECT COUNT(*) AS count
      FROM customermaster
      WHERE customercode = :customercode
    `, params);

    if (Number(rows[0]?.count ?? 0) === 0) {
        await connection.execute(`
        INSERT INTO customermaster SET
          customercode = :customercode,
          type = :type,
          headofficecode = :headofficecode,
          routecode = :routecode,
          streetcode = :streetcode,
          districtcode = :districtcode,
          locationcode = :locationcode,
          customersequence = :customersequence,
          customername = :customername,
          customeraddress1 = :customeraddress1,
          customeraddress2 = :customeraddress2,
          customerphone = :customerphone,
          balance = :balance,
          customercategory = :customercategory,
          pricingkey = :pricingkey,
          promotionkey = :promotionkey,
          authorizeditemgrpkey = :authorizeditemgrpkey,
          messagekey1 = :messagekey1,
          messagekey2 = :messagekey2,
          invoicepaymentterms = :invoicepaymentterms,
          invoiceretailoption = :invoiceretailoption,
          invoicepriceoverride = :invoicepriceoverride,
          invoiceretailoverride = :invoiceretailoverride,
          invoiceformatoption = :invoiceformatoption,
          invoiceextensionopt = :invoiceextensionopt,
          invoicedsdpromptopt = :invoicedsdpromptopt,
          invoicecopies = :invoicecopies,
          salesinputoprion = :salesinputoprion,
          returnsinputoption = :returnsinputoption,
          invoiceinputstyle = :invoiceinputstyle,
          onhandspromptopt = :onhandspromptopt,
          inventoryselectopt = :inventoryselectopt,
          invencontaineropt = :invencontaineropt,
          queuedreportoption = :queuedreportoption,
          surveykey = :surveykey,
          contactname = :contactname,
          customertype = :customertype,
          callfrequency = :callfrequency,
          routenumber = :routenumber,
          arbcustomernameshort = :arbcustomernameshort,
          arbcustomername = :arbcustomername,
          arbcustomeraddress1 = :arbcustomeraddress1,
          arbcustomeraddress2 = :arbcustomeraddress2,
          hhccustomernameshort = :hhccustomernameshort,
          hhccustomername = :hhccustomername,
          hhccustomeraddress1 = :hhccustomeraddress1,
          hhccustomeraddress2 = :hhccustomeraddress2,
          allowbeyondlimit = :allowbeyondlimit,
          tclimit = :tclimit,
          activecustomer = :activecustomer,
          creditlimitdays = :creditlimitdays,
          created = :created,
          cdat = :cdat,
          modified = :modified,
          mdat = :mdat,
          forcehand = :forcehand,
          renteddisplay = :renteddisplay,
          installedchiller = :installedchiller,
          monthlydepreciation = :monthlydepreciation,
          typeofgiveaway = :typeofgiveaway,
          giveawayflag = :giveawayflag,
          lastvisiteddate = :lastvisiteddate,
          memo1 = :memo1,
          memo2 = :memo2,
          tcsubtype = :tcsubtype,
          rentperc = :rentperc,
          customeraddress3 = :customeraddress3,
          customercity = :customercity,
          customerstate = :customerstate,
          customerzip = :customerzip,
          authorizeditemlistctl = :authorizeditemlistctl,
          invoicepriceprint = :invoicepriceprint,
          messagekey3 = :messagekey3,
          messagekey4 = :messagekey4,
          messagekey5 = :messagekey5,
          messagekey6 = :messagekey6,
          orderformat = :orderformat,
          enableupcprint = :enableupcprint,
          enabledelayprint = :enabledelayprint,
          printsequence = :printsequence,
          enablepriceeditinvs = :enablepriceeditinvs,
          enablesellprevious = :enablesellprevious,
          enablesuggestsales = :enablesuggestsales,
          enableautofillreturns = :enableautofillreturns,
          enableautofilldamaged = :enableautofilldamaged,
          enablesigcapture = :enablesigcapture,
          enablereturnstrxn = :enablereturnstrxn,
          enableexchangetrxn = :enableexchangetrxn,
          enabledamagedreturns = :enabledamagedreturns,
          enablearcollection = :enablearcollection,
          enablesurveyaudit = :enablesurveyaudit,
          enabledelivinstruct = :enabledelivinstruct,
          enableinvoicecomment = :enableinvoicecomment,
          invoicedetailentry = :invoicedetailentry,
          orderdetailentry = :orderdetailentry,
          forcestockcapture = :forcestockcapture,
          enablepromotrxn = :enablepromotrxn,
          alternatecode = :alternatecode,
          creditlimit = :creditlimit,
          allowcashoncreditexceed = :allowcashoncreditexceed,
          arbcustomeraddress3 = :arbcustomeraddress3,
          templateindicator = :templateindicator,
          templatename = :templatename,
          arbcontactname = :arbcontactname,
          printlanguageflag = :printlanguageflag,
          quantumno = :quantumno,
          lostplacementdelivs = :lostplacementdelivs,
          newplacementdelivs = :newplacementdelivs,
          currencycode = :currencycode,
          histmaxdeliveries = :histmaxdeliveries,
          arcustomertype = :arcustomertype,
          custtaxkey1 = :custtaxkey1,
          custtaxkey2 = :custtaxkey2,
          custtaxkey3 = :custtaxkey3,
          customertaxid = :customertaxid,
          customertaxidoptions = :customertaxidoptions,
          outletsubtype = :outletsubtype,
          volume = :volume,
          enablegovtaxnote = :enablegovtaxnote,
          forwardcoverfactor = :forwardcoverfactor,
          enablepromoeditinvs = :enablepromoeditinvs,
          enableaddlpromoinvs = :enableaddlpromoinvs,
          badcreditcustomer = :badcreditcustomer,
          enableduplicateprinting = :enableduplicateprinting,
          numoutstandinginv = :numoutstandinginv,
          enablefocprinting = :enablefocprinting,
          promooptions = :promooptions,
          groupcode = :groupcode,
          forceposcheck = :forceposcheck,
          ancustomercode = :ancustomercode,
          printoutletitemcode = :printoutletitemcode,
          reportprintcontrol = :reportprintcontrol,
          invoicelimiter = :invoicelimiter,
          exclusiveopmode = :exclusiveopmode,
          returnpromotionkey = :returnpromotionkey,
          invoiceformat = :invoiceformat,
          liquorlicprint = :liquorlicprint,
          enablepromoeditords = :enablepromoeditords,
          enableaddlpromoords = :enableaddlpromoords,
          enableaddlpromoinvoices = :enableaddlpromoinvoices,
          enableposequipment = :enableposequipment,
          enablesalestrxn = :enablesalestrxn,
          enableadvancepayment = :enableadvancepayment,
          printcheckdetails = :printcheckdetails,
          tcspecialdiscount = :tcspecialdiscount,
          spldiscountdays = :spldiscountdays,
          arabiccustomercity = :arabiccustomercity,
          threshholdlimit = :threshholdlimit,
          discountkey = :discountkey,
          enforcepromotion = :enforcepromotion,
          gpcustcode = :gpcustcode,
          cashonlypromo = :cashonlypromo,
          roundnetamount = :roundnetamount,
          partialcollection = :partialcollection,
          transactiontype = :transactiontype,
          enabledraftcopy = :enabledraftcopy,
          enablebuybackfree = :enablebuybackfree,
          enablecpd = :enablecpd,
          enablepaymentsel = :enablepaymentsel,
          gpsdata = :gpsdata,
          fixedlatitude = :fixedlatitude,
          fixedlongitude = :fixedlongitude,
          rentkey = :rentkey,
          startdate = :startdate,
          enddate = :enddate,
          definitionvalue = :definitionvalue,
          runningvalue = :runningvalue,
          rentcontrol = :rentcontrol,
          disablebalanceupdate = :disablebalanceupdate,
          enablecreditlimit = :enablecreditlimit,
          autosettlecollection = :autosettlecollection,
          enableinvoicecopy = :enableinvoicecopy,
          pobox = :pobox,
          shoptelephonenumber = :shoptelephonenumber,
          shopfaxnumber = :shopfaxnumber,
          ownername = :ownername,
          ownerlandlinenumber = :ownerlandlinenumber,
          ownermobilenumber = :ownermobilenumber,
          contactpersonlandlinenumber = :contactpersonlandlinenumber,
          contactpersonmobilenumber = :contactpersonmobilenumber,
          contactpersonemail = :contactpersonemail,
          purchasemanagername = :purchasemanagername,
          purchasemanagerlandlinenumber = :purchasemanagerlandlinenumber,
          purchasemanagermobilenumber = :purchasemanagermobilenumber,
          purchasemanageremail = :purchasemanageremail,
          warehousemanagername = :warehousemanagername,
          warehousemanagerlandlinenumber = :warehousemanagerlandlinenumber,
          warehousemanagermobilenumber = :warehousemanagermobilenumber,
          warehousemanageremail = :warehousemanageremail,
          expirylimit = :expirylimit,
          exprunningvalue = :exprunningvalue,
          distributionkey = :distributionkey,
          gpssavecount = :gpssavecount,
          graceperiod = :graceperiod,
          reportcustcode = :reportcustcode,
          enablerental = :enablerental,
          enableautofillsales = :enableautofillsales,
          enablebatchselection = :enablebatchselection
      `, params);

        return Number(item.customercode) > 0;
    }

    await connection.execute(`
      UPDATE customermaster SET
        streetcode = :streetcode,
        districtcode = :districtcode,
        locationcode = :locationcode,
        customersequence = :customersequence,
        customername = :customername,
        customeraddress1 = :customeraddress1,
        customeraddress2 = :customeraddress2,
        customerphone = :customerphone,
        balance = :balance,
        contactname = :contactname,
        modified = :modified,
        mdat = :mdat,
        customeraddress3 = :customeraddress3,
        customercity = :customercity,
        customerstate = :customerstate,
        customerzip = :customerzip,
        fixedlatitude = :fixedlatitude,
        fixedlongitude = :fixedlongitude
      WHERE customercode = :customercode
    `, params);

    return Number(item.customercode) > 0;
}
/** Stores the reason a planned customer visit was not serviced. */
export async function saveNonServicedCustomer(connection: PoolConnection, item: Record<string, any>): Promise<boolean> {
    const params = {
        routeKey: required(item.routekey),
        customerCode: required(item.customercode),
        reasonCode: required(item.reasoncode)
    };
    const [rows] = await connection.execute<(RowDataPacket & {
        count: number;
    })[]>(`
      SELECT COUNT(*) AS count
      FROM nonservicedcustomer
      WHERE routekey = :routeKey
      AND customercode = :customerCode
    `, params);
    if (Number(rows[0]?.count ?? 0) === 0) {
        await connection.execute(`
        INSERT INTO nonservicedcustomer SET
          routekey = :routeKey,
          customercode = :customerCode,
          reasoncode = :reasonCode
      `, params);
    }
    return Number(item.routekey) > 0;
}
/** Saves a no-sale visit header and returns the affected/generated key. */
export async function saveNoSalesHeader(connection: PoolConnection, item: Record<string, any>): Promise<number> {
    const [insertResult] = await connection.execute<ResultSetHeader>(`
      INSERT INTO nosalesheader SET
        routekey = :routeKey, visitkey = :visitKey, documentnumber = :documentNumber,
        invoicenumber = :invoiceNumber, routecode = :routeCode, salesmancode = :salesmanCode,
        transactiondate = :transactionDate, transactiontime = :transactionTime,
        nosalereasoncode = :noSaleReasonCode, voidflag = :voidFlag,
        transmitindicator = :transmitIndicator, customercode = :customerCode,
        hhcdocumentnumber = :hhcDocumentNumber, hhcinvoicenumber = :hhcInvoiceNumber,
        data = :data
    `, {
        routeKey: required(item.routekey),
        visitKey: required(item.visitkey),
        documentNumber: required(item.documentnumber),
        invoiceNumber: required(item.invoicenumber),
        routeCode: required(item.routecode),
        salesmanCode: required(item.salesmancode),
        transactionDate: required(item.transactiondate),
        transactionTime: nullable(item.transactiontime),
        noSaleReasonCode: required(item.nosalereasoncode),
        voidFlag: required(item.voidflag),
        transmitIndicator: nullable(item.transmitindicator),
        customerCode: nullable(item.customercode),
        hhcDocumentNumber: nullable(item.hhcdocumentnumber),
        hhcInvoiceNumber: nullable(item.hhcinvoicenumber),
        data: nullable(item.data)
    });
    return insertResult.insertId;
}
/** Saves customer shelf/inventory quantities captured during a visit. */
export async function saveCustomerInventoryDetail(connection: PoolConnection, item: Record<string, any>): Promise<boolean> {
    const params = {
        routeKey: required(item.routekey),
        visitKey: required(item.visitkey),
        itemCode: required(item.itemcode),
        weighted: nullable(item.weighted),
        qtyLoc1Case: nullable(item.qtyloc1case),
        catchWeightQtyLoc1: nullable(item.catchweightqtyloc1),
        qtyLoc1Each: nullable(item.qtyloc1each),
        qtyLoc2Case: nullable(item.qtyloc2case),
        catchWeightQtyLoc2: nullable(item.catchweightqtyloc2),
        qtyLoc2Each: nullable(item.qtyloc2each),
        qtyLoc3Case: nullable(item.qtyloc3case),
        catchWeightQtyLoc3: nullable(item.catchweightqtyloc3),
        qtyLoc3Each: nullable(item.qtyloc3each),
        shelfStockCase: nullable(item.shelfstockcase),
        shelfStockCatchWeightQty: nullable(item.shelfstockcatchweightqty),
        shelfStockEach: nullable(item.shelfstockeach),
        oldestCode: nullable(item.oldestcode),
        expiryDate: nullable(item['expirydate'])
    };
    const [rows] = await connection.execute<(RowDataPacket & {
        count: number;
    })[]>(`
      SELECT COUNT(*) AS count
      FROM customerinventorydetail
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND itemcode = :itemCode
      AND expirydate = :expiryDate
    `, params);
    if (Number(rows[0]?.count ?? 0) === 0) {
        await connection.execute(`
        INSERT INTO customerinventorydetail SET
          routekey = :routeKey, visitkey = :visitKey, itemcode = :itemCode,
          weighted = :weighted, qtyloc1case = :qtyLoc1Case,
          catchweightqtyloc1 = :catchWeightQtyLoc1, qtyloc1each = :qtyLoc1Each,
          qtyloc2case = :qtyLoc2Case, catchweightqtyloc2 = :catchWeightQtyLoc2,
          qtyloc2each = :qtyLoc2Each, qtyloc3case = :qtyLoc3Case,
          catchweightqtyloc3 = :catchWeightQtyLoc3, qtyloc3each = :qtyLoc3Each,
          shelfstockcase = :shelfStockCase,
          shelfstockcatchweightqty = :shelfStockCatchWeightQty,
          shelfstockeach = :shelfStockEach, oldestcode = :oldestCode,
          expirydate = :expiryDate
      `, params);
    }
    else {
        await connection.execute(`
        UPDATE customerinventorydetail
        SET qtyloc1each = :qtyLoc1Each
        WHERE routekey = :routeKey
        AND visitkey = :visitKey
        AND itemcode = :itemCode
      `, params);
    }
    return true;
}
/** Saves the customer inventory-check header/status uploaded by mobile. */
export async function saveCustomerInventoryCheck(connection: PoolConnection, item: Record<string, any>): Promise<boolean> {
    const params = {
        routeKey: required(item.routekey),
        visitKey: required(item.visitkey),
        itemCode: required(item.itemcode),
        weighted: nullable(item.weighted),
        qtyLoc1Case: nullable(item.qtyloc1case),
        catchWeightQtyLoc1: nullable(item.catchweightqtyloc1),
        qtyLoc1Each: nullable(item.qtyloc1each),
        qtyLoc2Case: nullable(item.qtyloc2case),
        catchWeightQtyLoc2: nullable(item.catchweightqtyloc2),
        qtyLoc2Each: nullable(item.qtyloc2each),
        qtyLoc3Case: nullable(item.qtyloc3case),
        catchWeightQtyLoc3: nullable(item.catchweightqtyloc3),
        qtyLoc3Each: nullable(item.qtyloc3each),
        shelfStockCase: nullable(item.shelfstockcase),
        shelfStockCatchWeightQty: nullable(item.shelfstockcatchweightqty),
        shelfStockEach: nullable(item.shelfstockeach),
        oldestCode: nullable(item.oldestcode),
        expiryDate: nullable(item['expiry_date'])
    };
    const [rows] = await connection.execute<(RowDataPacket & {
        count: number;
    })[]>(`
      SELECT COUNT(*) AS count
      FROM customerinventorycheck
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND itemcode = :itemCode
      AND expiry_date = :expiryDate
    `, params);
    if (Number(rows[0]?.count ?? 0) === 0) {
        await connection.execute(`
        INSERT INTO customerinventorycheck SET
          routekey = :routeKey, visitkey = :visitKey, itemcode = :itemCode,
          weighted = :weighted, qtyloc1case = :qtyLoc1Case,
          catchweightqtyloc1 = :catchWeightQtyLoc1, qtyloc1each = :qtyLoc1Each,
          qtyloc2case = :qtyLoc2Case, catchweightqtyloc2 = :catchWeightQtyLoc2,
          qtyloc2each = :qtyLoc2Each, qtyloc3case = :qtyLoc3Case,
          catchweightqtyloc3 = :catchWeightQtyLoc3, qtyloc3each = :qtyLoc3Each,
          shelfstockcase = :shelfStockCase,
          shelfstockcatchweightqty = :shelfStockCatchWeightQty,
          shelfstockeach = :shelfStockEach, oldestcode = :oldestCode,
          expiry_date = :expiryDate
      `, params);
    }
    return Number(item.routekey) > 0;
}
/** Saves customer distribution compliance results for an item/visit. */
export async function saveCustomerDistributionCheck(connection: PoolConnection, item: Record<string, any>): Promise<boolean> {
    const params = {
        routeKey: required(item.routekey),
        customerCode: required(item.customercode),
        visitKey: required(item.visitkey),
        itemCode: required(item.itemcode),
        qty: nullable(item.qty),
        distributionKey: nullable(item.distributionkey)
    };
    const [rows] = await connection.execute<(RowDataPacket & {
        count: number;
    })[]>(`
      SELECT COUNT(*) AS count
      FROM customerdistributioncheck
      WHERE customercode = :customerCode
      AND routekey = :routeKey
      AND visitkey = :visitKey
      AND itemcode = :itemCode
    `, params);
    if (Number(rows[0]?.count ?? 0) === 0) {
        await connection.execute(`
        INSERT INTO customerdistributioncheck SET
          routekey = :routeKey,
          customercode = :customerCode,
          visitkey = :visitKey,
          qty = :qty,
          distributionkey = :distributionKey,
          itemcode = :itemCode
      `, params);
    }
    else {
        await connection.execute(`
        UPDATE customerdistributioncheck
        SET qty = :qty,
          distributionkey = :distributionKey
        WHERE customercode = :customerCode
        AND routekey = :routeKey
        AND visitkey = :visitKey
        AND itemcode = :itemCode
      `, params);
    }
    return Number(item.itemcode) > 0;
}
/** Updates route-goal progress and returns the affected row count. */
export async function saveRouteGoal(connection: PoolConnection, item: Record<string, any>): Promise<number> {
    const [insertResult] = await connection.execute<ResultSetHeader>(`
      INSERT INTO routegoal SET
        routecode = :routeCode,
        salesmancode = :salesmanCode,
        packagenumber = :packageNumber,
        todaysgoal = :todaysGoal,
        todaysachieve = :todaysAchieve,
        quotadesckey1 = :quotaDescKey1,
        quotagoal1 = :quotaGoal1,
        quotaachieve1 = :quotaAchieve1,
        quotareset1 = :quotaReset1,
        quotadesckey2 = :quotaDescKey2,
        quotagoal2 = :quotaGoal2,
        quotaachieve2 = :quotaAchieve2,
        quotareset2 = :quotaReset2,
        quotadesckey3 = :quotaDescKey3,
        quotagoal3 = :quotaGoal3,
        quotaachieve3 = :quotaAchieve3,
        quotareset3 = :quotaReset3,
        created = :created,
        cdat = :createdDate,
        modified = :modified,
        mdat = :modifiedDate,
        mmonth = :month,
        fromdate = :fromDate,
        todate = :toDate,
        quantity = :quantity,
        achievequantity = :achieveQuantity
    `, {
        routeCode: nullable(item.routecode),
        salesmanCode: nullable(item.salesmancode),
        packageNumber: nullable(item.packagenumber),
        todaysGoal: nullable(item.todaysgoal),
        todaysAchieve: nullable(item.todaysachieve),
        quotaDescKey1: nullable(item.quotadesckey1),
        quotaGoal1: nullable(item.quotagoal1),
        quotaAchieve1: nullable(item.quotaachieve1),
        quotaReset1: nullable(item.quotareset1),
        quotaDescKey2: nullable(item.quotadesckey2),
        quotaGoal2: nullable(item.quotagoal2),
        quotaAchieve2: nullable(item.quotaachieve2),
        quotaReset2: nullable(item.quotareset2),
        quotaDescKey3: nullable(item.quotadesckey3),
        quotaGoal3: nullable(item.quotagoal3),
        quotaAchieve3: nullable(item.quotaachieve3),
        quotaReset3: nullable(item.quotareset3),
        created: nullable(item.created),
        createdDate: nullable(item.cdat),
        modified: nullable(item.modified),
        modifiedDate: nullable(item.mdat),
        month: nullable(item.mmonth),
        fromDate: required(item.fromdate),
        toDate: required(item.todate),
        quantity: required(item.quantity),
        achieveQuantity: required(item.achievequantity)
    });
    return insertResult.insertId;
}
/** Inserts or updates the customer's free-of-charge balance. */
export async function saveCustomerFocBalance(connection: PoolConnection, item: Record<string, any>): Promise<boolean> {
    const params = {
        customerCode: required(item.customercode),
        itemCode: required(item.itemcode),
        originalQty: nullable(item.originalqty),
        balanceQty: nullable(item.balanceqty),
        contractId: nullable(item.contractid),
        startDate: nullable(item.startdate)
    };
    const [rows] = await connection.execute<(RowDataPacket & {
        count: number;
    })[]>(`
      SELECT COUNT(*) AS count
      FROM customer_foc_balance
      WHERE customercode = :customerCode
      AND itemcode = :itemCode
    `, params);
    if (Number(rows[0]?.count ?? 0) === 0) {
        await connection.execute(`
        INSERT INTO customer_foc_balance SET
          customercode = :customerCode,
          itemcode = :itemCode,
          originalqty = :originalQty,
          balanceqty = :balanceQty,
          contractid = :contractId,
          startdate = :startDate
      `, params);
    }
    else {
        await connection.execute(`
        UPDATE customer_foc_balance SET
          customercode = :customerCode,
          itemcode = :itemCode,
          originalqty = :originalQty,
          balanceqty = :balanceQty,
          contractid = :contractId,
          startdate = :startDate
        WHERE customercode = :customerCode
        AND itemcode = :itemCode
      `, params);
    }
    return Number(item.customercode) > 0;
}
/** Saves the mobile end-day denomination/detail record. */
export async function saveEndDayDetailUpload(connection: PoolConnection, item: Record<string, any>): Promise<boolean> {
    const params = {
        routeKey: required(item.routekey),
        detailTypeCode: required(item.detailtypecode),
        listTypeCode: required(item.listtypecode),
        amount: nullable(item.amount),
        currencyCode: nullable(item.currencycode)
    };
    await connection.execute(`
      INSERT INTO enddaydetail SET
        routekey = :routeKey,
        detailtypecode = :detailTypeCode,
        listtypecode = :listTypeCode,
        amount = :amount,
        currencycode = :currencyCode
    `, params);
    const [rows] = await connection.execute<(RowDataPacket & {
        count: number;
    })[]>(`
      SELECT COUNT(*) AS count
      FROM ardetail
      WHERE routekey = :routeKey
    `, params);
    return Number(rows[0]?.count ?? 0) > 0;
}
