const Users = require("./Users/user");
const Login = require("./Login/login");
const Register = require("./Registration/registration");
const Menu = require("./Menu/menu");
const Gender = require("./Gender/gender");
const GenderCategory = require("./Gender_Category/gender_category");
const FitCategory = require("./Fit_Category/fit_category");
const RiseLabel = require("./Rise_Label/rise_label");
const Style = require("./Style/style");
const Wash = require("./Wash/wash");
const Fabric = require("./Fabric/fabric");
const Product_Status = require("./Product_Status/product_status");
const Product_Class = require("./Product_Class/product_class");
const Item_Type = require("./Item_Type/item_type");
const Cut = require("./Cut/Cut");
const InseamLabel = require("./InseamLabel/InseamLabel");
const Rise = require("./Rise/Rise");
const Items = require("./Items/items");
const Season = require("./Season/season");
const WashType = require("./Wash_Type/wash_type");
const Size = require("./Size/size");
const Inseam = require("./Inseam/inseam");
const Logs = require("./Logs/log");
const UserCompany = require("./UserCompany/userCompany");
const OrderStatus = require("./OrderStatus/orderStatus");
const RegionCategory = require("./RegionCategory/regionCategory");
const SalesPerson = require("./SalesPerson/salesPerson");
const StyleCombination = require("./StyleCombination/styleCombination");
const Account = require("./Account/account");
const AccountType = require("./AccountType/accountType");
const PaymentType = require("./PaymentType/paymentType");
const Globalsearch = require("./globalSearch/globalSearch");

 
//Admin Controllers
const Admin_Company = require("./Admin/Admin_Company/admin_company");
const Admin_Menu_User_Rights = require("./Admin/Admin_Menu_User_Rights/admin_menu_user_right");
const AdminCountry = require("./Admin/AdminCountry/adminCountry");
const AdminCity = require("./Admin/AdminCity/adminCity");
const AdminState = require("./Admin/AdminState/adminState");
const AdminRegion = require("./Admin/AdminRegion/adminRegion");
const AdminCourierService = require("./Admin/AdminCourierService/adminCourierService");
const AdminFreightTerm = require("./Admin/AdminFreightTerm/adminFreightTerm");
const AdminShippingMethod = require("./Admin/AdminShippingMethod/adminShippingMethod");
const AdminLocation = require("./Admin/AdminLocation/adminLocation");
const AdminBerganBilling = require("./Admin/AdminBerganBilling/adminBerganBilling");
const AdminCurrency = require("./Admin/AdminCurrency/adminCurrency");
const AdminJob = require("./Admin/AdminJob/adminJob");
const AdminShipVia = require("./Admin/AdminShipVia/adminShipVia");
const AdminMenu = require("./Admin/Admin_Menu/adminMenu");
const AdminShipTaxCode = require("./Admin/AdminShipTaxCode/adminShipTaxCode");
const AdminFactor = require("./Admin/AdminFactor/adminFactor");
const AdminTax = require("./Admin/AdminTax/adminTax");
const AdminDiscount = require("./Admin/AdminDiscount/adminDiscount");
const Admin_Menu_Type = require("./Admin/Admin_Menu_Type/admin_menu_type");
const AdminModule = require("./Admin/Admin_Module/admin_module");
const AdminUserCompany = require("./Admin/AdminUserCompany/adminUserCompany");
const AdminReturnReason = require("./Admin/AdminReturnReason/adminReturnReason");
const AdminReturnType = require("./Admin/AdminReturnType/adminReturrnType");
const AdminPaymentMethod = require("./Admin/AdminPaymentMethod/adminPaymentMethod");
const Adminpaymentmethodtype = require("./Admin/AdminPaymentMethodType/AdminPaymentMethodType");
const AdminBarganPaymentterm = require("./Admin/AdminBerganPaymentTerm/adminBerganPaymentTerm");


//Customer Controllers
const CustomerTerm = require("./Customer/CustomerTerm/customerTerm");
const CustomerType = require("./Customer/CustomerType/customerType");
const CustomerSales = require("./Customer/CustomerSales/customerSale");
const Customer = require("./Customer/customer");
const CustomerBill = require("./Customer/CustomerBill/customerBill");
const CustomerShip = require("./Customer/CustomerShip/customerShip");
const PTStatus = require("./PTStatus/ptStatus");
const ShipStatus = require("./ShipStatus/shipStatus");
const FiscalYear = require("./FiscalYear/fiscalYear");
const FiscalYearPeriod = require("./FiscalYearPeriod/fiscalYearPeriod");
const SCMBrand = require("./SCMBrand/scmBrand");
const SCMFigure = require("./SCMFigure/scmFigure");
const SCMSaleTarget = require("./SCMSaleTarget/scmSaleTarget");
const SCMTargetMonth = require("./SCMTargerMonth/scmTargetMonth");
const SCMTargetYear = require("./SCMTargerYear/scmTargetYear");
const SCMVendor = require("./SCMVendor/scmVendor");
const VendorBill = require("./SCMVendor/VendorBill/vendorBill");
const VendorShip = require("./SCMVendor/VendorShip/vendorShip");
const SCMVendorCategory = require("./SCMVenderCategory/scmVendorCategory");
const SysReportParameter = require("./SysReportParameter/sysReportParameter")


//Headers
const SaleOrderHeader = require("./Headers/SaleOrderHeader/saleOrderHeader");
const OrderShipHeader = require("./Headers/OrderShipHeader/orderShipHeader");
const InvoiceHeader = require("./Headers/InvoiceHeader/invoiceHeader");
const SaleReturnHeader = require("./Headers/SaleReturnHeader/saleReturnHeader");
const ReceiptHeader = require("./Headers/ReceiptHeader/receiptHeader");
const CreditHeader = require("./Headers/CreditHeader/creditHeader");
const PayPurchaseBillHeader = require("./Headers/PayPurchaseBillHeader/payPurchaseBillHeader");
const INVItemTransferHeader = require("./Headers/INVItemTransferHeader/iNVItemTransferHeader");
const PayCustomerPaymentHeader = require("./Headers/PayCustomerPaymentHeader/payCustomerPaymentHeader.js");//javed
const VoucherHeader = require("./Headers/VoucherHeader/glVoucherHeader");
const PayBillPaymentHeader = require("./Headers/PayBillPaymentHeader/payBillPaymentHeader");
const InvStockAdjustmentHeader = require("./Headers/InvStockAdjustmentHeader/InvStockAdjustmentHeader");
const FundTransferHeader = require("./Headers/Fund_Transfer/fundtransfer");
const payBankDepositHeader = require("./Headers/PayBankDepositHeader/PayBankDepositHeader");
const customerRefundHeader = require("./Headers/CustomerRefundHeader/customerRefundHeader");


//Lines
const SaleOrderLine = require("./Lines/SaleOrderLine/saleOrderLine");
const OrderShipLines = require("./Lines/OrderShipLines/orderShipLines");
const InvoiceLine = require("./Lines/InvoiceLine/invoiceLine");
const SaleReturnLine = require("./Lines/SaleReturnLine/saleReturnLine");
const ReceiptLine = require("./Lines/ReceiptLine/receiptLine");
const CreditLine = require("./Lines/CreditLine/creditLine");
const PayPurchaseBillItem = require("./Lines/PayPurchaseBillItem/payPurchaseBillItem");
const PayPurchaseBillExpense = require("./Lines/PayPurchaseBillExpense/payPurchaseBillExpense");
const INVItemTransferLine = require("./Lines/INVItemTransferLine/iNVItemTransferLine");
const ReportURL = require("./ReportURL/reportURL")
const FabricComposition = require("./FabricComposition/fabricComposition")
const FabricClass = require("./FabricClass/fabricClass")
const ProductType = require("./Product_type/product_type")
const FabricClass2 = require("./FabricClass2/fabricClass2")
const FabricType = require("./FabricType/fabricType")
const FabricUsable = require("./FabricUsable/fabricUsable")
const FileUpload = require("./Upload/upload");
const CustomerCommunication = require("./Customer Communication/customerComminucation");
const CommitCriteria = require("./Commit Criteria/commitCriteria")
const CashBack = require("./Cash Back/cashBack")
const PayCustomerPaymentInvoice = require("./Lines/PayCustomerPaymentInvoice/payCustomerPaymentInvoice");
const PayCustomerPaymentNote = require("./Lines/PayCustomerPaymentNote/payCustomerPaymentNote");
const voucherLine = require("./Lines/VoucherLine/voucherLine");
const PayBillPaymentLine = require("./Lines/PayBillPaymentLine/payBillPaymentLine");
const PayBillDirectPaymentHeader = require("./Headers/PayBillDirectPaymentHeader/payBillDirectPaymentHeader");
const PayBillDirectPaymentExpense = require("./Lines/PayBillDirectPaymentExpense/payBillDirectPaymentExpense");
const PayBillDirectPaymentItem = require("./Lines/PayBillDirectPaymentItem/payBillDirectPaymentItem");
const ARACCOUNT = require("./Headers/A-R_Account/aR_Account");
const AdminPaymentTypes = require("./Admin/Admin_Payment_Types/adminPaymentTypes");
const CustomerPaymentLines = require("./Customer Payment Lines/customerPaymentLines");
const InvStockAdjustmentLines = require("./Lines/InvStockAdjustmentLines/InvStockAdjustmentLines");
const PayBankDepositLines = require("./Lines/PayBankDepositLines/payBankDepositLines");
const TermForPrint = require("./TermForPrint/termForPrint");
const CreditNoteInvoive = require("./Lines/CreditNoteInvoice/creditNoteInvoice");
const CustomerRefundLine = require("./Lines/CustomerRefundLine/CustomerRefundLine"); 


//OMS_Reports
const booking = require ("./OMS_Reports/RegionsWise/Booking"); 
const Pending = require ("./OMS_Reports/RegionsWise/Pending");
const business = require("./OMS_Reports/RegionsWise/Business");
const shipping = require ("./OMS_Reports/RegionsWise/shipping");
const pod = require ("./OMS_Reports/RegionsWise/Pod");
const Stock = require("./OMS_Reports/RegionsWise/Stock");
const Return = require("./OMS_Reports/RegionsWise/Return");
const OTS = require("./OMS_Reports/RegionsWise/OTS");
const Payment = require("./OMS_Reports/RegionsWise/payment");
const ComparisonReport = require("./OMS_Reports/RegionsWise/Sale_Comparison");
const saleOrder = require("./OMS_Reports/RegionsWise/saleOrder")

//DBConnection Check
const DBConnection = require("./DBConnection/Dbconnection")

const myTestController = require("./Test/test")

module.exports = {
    Account,
    AccountType,
    Admin_Company,
    Admin_Menu_Type,
    Admin_Menu_User_Rights,
    AdminBerganBilling,
    AdminCity,
    AdminCountry,
    AdminCourierService,
    AdminCurrency,
    AdminDiscount,
    AdminFactor,
    AdminFreightTerm,
    AdminJob,
    AdminLocation,
    AdminMenu,
    AdminModule,
    AdminRegion,
    AdminReturnReason,
    AdminReturnType,
    AdminShippingMethod,
    AdminShipTaxCode,
    AdminShipVia,
    AdminState,
    AdminTax,
    AdminUserCompany,
    CreditHeader,
    CreditLine,
    Customer,
    CustomerBill,
    CustomerSales,
    CustomerShip,
    CustomerTerm,
    CustomerType,
    Cut,
    Fabric,
    FiscalYear,
    FiscalYearPeriod,
    FitCategory,
    Gender,
    GenderCategory,
    Inseam,
    InseamLabel,
    INVItemTransferHeader,
    INVItemTransferLine,
    InvoiceHeader,
    InvoiceLine,
    Item_Type,
    Items,
    Login,
    Logs,
    Menu,
    OrderShipHeader,
    OrderShipLines,
    OrderStatus,
    PayPurchaseBillExpense,
    PayPurchaseBillHeader,
    PayPurchaseBillItem,
    Product_Class,
    Product_Status,
    PTStatus,
    ReceiptHeader,
    ReceiptLine,
    RegionCategory,
    Register,
    Rise,
    RiseLabel,
    SaleOrderHeader,
    SaleOrderLine,
    SaleReturnHeader,
    SaleReturnLine,
    SalesPerson,
    SCMBrand,
    SCMFigure,
    SCMSaleTarget,
    SCMTargetMonth,
    SCMTargetYear,
    SCMVendor,
    SCMVendorCategory,
    SCMVendorCategory,
    Season,
    ShipStatus,
    Size,
    Style,
    StyleCombination,
    UserCompany,
    Users,
    VendorBill,
    VendorShip,
    Wash,
    WashType,
    ReportURL,
    FabricComposition,
    ProductType,
    FabricClass,
    FabricClass2,
    FabricType,
    FabricUsable,
    FileUpload,
    CustomerCommunication,
    CommitCriteria,
    CashBack,
    PayCustomerPaymentHeader,
    PayCustomerPaymentInvoice,
    PayCustomerPaymentNote,
    VoucherHeader,
    voucherLine,
    PayBillPaymentHeader,
    PayBillPaymentLine,
    PayBillDirectPaymentHeader,
    PayBillDirectPaymentExpense,
    PayBillDirectPaymentItem,
    ARACCOUNT,
    AdminPaymentTypes,
    CustomerPaymentLines,
    PaymentType,
    AdminPaymentMethod,
    InvStockAdjustmentHeader,
    InvStockAdjustmentLines,
    Adminpaymentmethodtype,
    FundTransferHeader,
    payBankDepositHeader,
    Globalsearch,
    PayBankDepositLines,
    TermForPrint,
    CreditNoteInvoive,
    Pending,
    SysReportParameter,
    booking,
    AdminBarganPaymentterm,
    business,
    shipping,
    pod,
    Stock,
    customerRefundHeader,
    Return,
    CustomerRefundLine,
    OTS,
    DBConnection,
    Payment,
    myTestController,
    ComparisonReport,
    saleOrder
};