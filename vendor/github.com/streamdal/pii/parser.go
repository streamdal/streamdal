package pii

import (
	"regexp"
	"strconv"
	"strings"
)

const (
	phonePattern          = `(?:(?:\+?\d{1,3}[-.\s*]?)?(?:\(?\d{3}\)?[-.\s*]?)?\d{3}[-.\s*]?\d{4,6})|(?:(?:(?:\(\+?\d{2}\))|(?:\+?\d{2}))\s*\d{2}\s*\d{3}\s*\d{4})`
	phonesWithExtsPattern = `(?i)(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*(?:[2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|(?:[2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?(?:[2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?(?:[0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(?:\d+)?)`
	linkPattern           = `(?:(?:https?:\/\/)?(?:[a-z0-9.\-]+|www|[a-z0-9.\-])[.](?:[^\s()<>]+|\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))*\))+(?:\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))*\)|[^\s!()\[\]{};:\'".,<>?]))`
	emailPattern          = `(?i)([A-Za-z0-9!#$%&'*+\/=?^_{|.}~-]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)`
	ipv4Pattern           = `(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)`
	ipv6Pattern           = `(?:(?:(?:[0-9A-Fa-f]{1,4}:){7}(?:[0-9A-Fa-f]{1,4}|:))|(?:(?:[0-9A-Fa-f]{1,4}:){6}(?::[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){5}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){4}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,3})|(?:(?::[0-9A-Fa-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){3}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,4})|(?:(?::[0-9A-Fa-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){2}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,5})|(?:(?::[0-9A-Fa-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){1}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|(?:(?::[0-9A-Fa-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9A-Fa-f]{1,4}){1,7})|(?:(?::[0-9A-Fa-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*`
	ipPattern             = ipv4Pattern + `|` + ipv6Pattern
	creditCardPattern     = `(?:(?:(?:\d{4}[- ]?){3}\d{4}|\d{15,16}))`
	creditCardBasePattern = `(?:\d[ -]*?){13,16}`
	//creditCardAltPattern   = `(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})`
	visaCreditCardPattern  = `4\d{3}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}`
	mcCreditCardPattern    = `5[1-5]\d{2}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}`
	streetAddressPattern   = `(?i)\d{1,4} [\w ]{1,20}(?:street|st|avenue|ave|road|rd|highway|hwy|square|sq|trail|trl|drive|dr|court|ct|park|parkway|pkwy|circle|cir|boulevard|blvd)\W?`
	zipCodePattern         = `\b\d{5}(?:[- ]\d{4})?\b`
	poBoxPattern           = `(?i)P\.? ?O\.? Box \d+`
	ssnPattern             = `\b\d{3}[- ]\d{2}[- ]\d{4}`
	indiaPanPattern        = `^[A-Z]{3}[ABCFGHLJPT]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$`
	guidPattern            = `[0-9a-fA-F]{8}-?[a-fA-F0-9]{4}-?[a-fA-F0-9]{4}-?[a-fA-F0-9]{4}-?[a-fA-F0-9]{12}`
	ibanPattern            = `(?i)[a-zA-Z]{2}[0-9]{2}[\t\f ]?[a-zA-Z0-9]{4}[\t\f ]?[0-9]{4}[\t\f ]?[0-9]{3}([a-zA-Z0-9][\t\f ]?[a-zA-Z0-9]{0,4}[\t\f ]?[a-zA-Z0-9]{0,4}[\t\f ]?[a-zA-Z0-9]{0,4}[\t\f ]?[a-zA-Z0-9]{0,3})?`
	vinPattern             = `[A-HJ-NPR-Z\d]{3}[A-HJ-NPR-Z\d]{5}[\dX][A-HJ-NPR-Z\d][A-HJ-NPR-Z\d][A-HJ-NPR-Z\d]{6}`
	uuid3Pattern           = `(?i)[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}`
	uuid4Pattern           = `(?i)[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}`
	uuid5Pattern           = `(?i)[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}`
	uuidPattern            = `(?i)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`
	dnsPattern             = `([a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62}){1}(\.[a-zA-Z0-9_]{1}[a-zA-Z0-9_-]{0,62})*[\._]?`
	urlSchemaPattern       = `(?i)((ftp|tcp|udp|wss?|https?):\/\/)`
	urlUsernamePattern     = `(\S+(:\S*)?@)`
	urlPathPattern         = `((\/|\?|#)[^\s]*)`
	urlPortPattern         = `(:(\d{1,5}))`
	beginWithZeroPattern   = `^0{2,}`
	testNumAPattern        = `^123`
	containsLettersPattern = `[a-zA-Z]`
	containsSpacesPattern  = `\s`
	altIPPattern           = `(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))`
	urlIPPattern           = `([1-9]\d?|1\d\d|2[01]\d|22[0-3])(\.(1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.([0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))`
	urlSubdomainPattern    = `((www\.)|([a-zA-Z0-9]([-\.][-\._a-zA-Z0-9]+)*))`
	urlPattern             = urlSchemaPattern + `?` + urlUsernamePattern + `?` + `((` + urlIPPattern + `|(\[` + altIPPattern + `\])|(([a-zA-Z0-9]([a-zA-Z0-9-_]+)?[a-zA-Z0-9]([-\.][a-zA-Z0-9]+)*)|(` + urlSubdomainPattern + `?))?(([a-zA-Z\x{00a1}-\x{ffff}0-9]+-?-?)*[a-zA-Z\x{00a1}-\x{ffff}0-9]+)(?:\.([a-zA-Z\x{00a1}-\x{ffff}]{1,}))?))\.?` + urlPortPattern + `?` + urlPathPattern + `?`
	filenamePattern        = `(?mi)[a-zA-Z0-9\-_\.\+]+?\.(ez|anx|atom|webp|atomcat|atomsrv|lin|cu|davmount|dcm|tsp|es|otf|ttf|pfr|woff|spl|gz|hta|jar|ser|class|js|json|m3g|hqx|cpt|nb|nbp|mbox|mdb|doc|dot|mxf|bin|deploy|msu|msp|oda|opf|ogx|one|onetoc2|onetmp|onepkg|pdf|pgp|key|sig|prf|ps|ai|eps|epsi|epsf|eps2|eps3|rar|rdf|rtf|stl|smi|smil|xhtml|xht|xml|xsd|xsl|xslt|xspf|zip|apk|cdy|deb|ddeb|udeb|sfd|kml|kmz|xul|xls|xlb|xlt|xlam|xlsb|xlsm|xltm|eot|thmx|cat|ppt|pps|ppam|pptm|sldm|ppsm|potm|docm|dotm|odc|odb|odf|odg|otg|odi|odp|otp|ods|ots|odt|odm|ott|oth|pptx|sldx|ppsx|potx|xlsx|xltx|docx|dotx|cod|mmf|sdc|sds|sda|sdd|sdf|sdw|sgl|sxc|stc|sxd|std|sxi|sti|sxm|sxw|sxg|stw|sis|cap|pcap|vsd|vst|vsw|vss|wbxml|wmlc|wmlsc|wpd|wp5|wk|7z|abw|dmg|bcpio|torrent|cab|cbr|cbz|cdf|cda|vcd|pgn|mph|cpio|csh|deb|udeb|dcr|dir|dxr|dms|wad|dvi|pfa|pfb|gsf|pcf|pcf\.Z|mm|spl|gan|gnumeric|sgf|gcf|gtar|tgz|taz|hdf|hwp|ica|info|ins|isp|iii|iso|jam|jnlp|jmz|chrt|kil|skp|skd|skt|skm|kpr|kpt|ksp|kwd|kwt|latex|lha|lyx|lzh|lzx|frm|maker|frame|fm|fb|book|fbdoc|mif|m3u8|application|manifest|wmd|wmz|com|exe|bat|dll|msi|nc|pac|nwc|o|oza|p7r|crl|pyc|pyo|qgs|shp|shx|qtl|rdp|rpm|rss|rb|sci|sce|xcos|sh|shar|swf|swfl|scr|sql|sit|sitx|sv4cpio|sv4crc|tar|tcl|gf|pk|texinfo|texi|~|%|bak|old|sik|t|tr|roff|man|me|ms|ustar|src|wz|crt|xcf|fig|xpi|xz|amr|awb|axa|au|snd|csd|orc|sco|flac|mid|midi|kar|mpga|mpega|mp2|mp3|m4a|m3u|oga|ogg|opus|spx|sid|aif|aiff|aifc|gsm|m3u|wma|wax|ra|rm|ram|ra|pls|sd2|wav|alc|cac|cache|csf|cbin|cascii|ctab|cdx|cer|c3d|chm|cif|cmdf|cml|cpa|bsd|csml|csm|ctx|cxf|cef|emb|embl|spc|inp|gam|gamin|fch|fchk|cub|gau|gjc|gjf|gal|gcg|gen|hin|istr|ist|jdx|dx|kin|mcm|mmd|mmod|mol|rd|rxn|sd|sdf|tgf|mcif|mol2|b|gpt|mop|mopcrt|mpc|zmt|moo|mvb|asn|prt|ent|val|aso|asn|pdb|ent|ros|sw|vms|vmd|xtel|xyz|gif|ief|jp2|jpg2|jpeg|jpg|jpe|jpm|jpx|jpf|pcx|png|svg|svgz|tiff|tif|djvu|djv|ico|wbmp|cr2|crw|ras|cdr|pat|cdt|cpt|erf|art|jng|bmp|nef|orf|psd|pnm|pbm|pgm|ppm|rgb|xbm|xpm|xwd|eml|igs|iges|msh|mesh|silo|wrl|vrml|x3dv|x3d|x3db|appcache|ics|icz|css|csv|323|html|htm|shtml|uls|mml|asc|txt|text|pot|brf|srt|rtx|sct|wsc|tm|tsv|ttl|vcf|vcard|jad|wml|wmls|bib|boo|h\+\+|hpp|hxx|hh|c\+\+|cpp|cxx|cc|h|htc|csh|c|d|diff|patch|hs|java|ly|lhs|moc|p|pas|gcd|pl|pm|py|scala|etx|sfv|sh|tcl|tk|tex|ltx|sty|cls|vcs|3gp|axv|dl|dif|dv|fli|gl|mpeg|mpg|mpe|ts|mp4|qt|mov|ogv|webm|mxu|flv|lsf|lsx|mng|asf|asx|wm|wmv|wmx|wvx|avi|movie|mpv|mkv|ice|sisx|vrm|vrml|wrl)`
	//repeatingNumPattern    = `(?i)((0{5,})|(1{5,})|(2{5,})|(3{5,})|(4{5,})|(5{5,})|(6{5,})|(7{5,})|(8{5,})|(9{5,}))`
)

// Compiled regular expressions
var (
	phoneRegexp          = regexp.MustCompile(phonePattern)
	phonesWithExtsRegexp = regexp.MustCompile(phonesWithExtsPattern)
	linkRegexp           = regexp.MustCompile(linkPattern)
	emailRegexp          = regexp.MustCompile(emailPattern)
	ipv4Regexp           = regexp.MustCompile(ipv4Pattern)
	ipv6Regexp           = regexp.MustCompile(ipv6Pattern)
	ipRegexp             = regexp.MustCompile(ipPattern)
	creditCardRegexp     = regexp.MustCompile(creditCardPattern)
	creditCardBaseRegexp = regexp.MustCompile(creditCardBasePattern)
	streetAddressRegexp  = regexp.MustCompile(streetAddressPattern)
	zipCodeRegexp        = regexp.MustCompile(zipCodePattern)
	poBoxRegexp          = regexp.MustCompile(poBoxPattern)
	ssnRegexp            = regexp.MustCompile(ssnPattern)
	guidRegexp           = regexp.MustCompile(guidPattern)
	visaCreditCardRegexp = regexp.MustCompile(visaCreditCardPattern)
	mcCreditCardRegexp   = regexp.MustCompile(mcCreditCardPattern)
	//altCreditCardRegexp   = regexp.MustCompile(creditCardAltPattern) -- Breaks on tinygo
	indiaPanRegexp = regexp.MustCompile(indiaPanPattern)
	ibanRegexp     = regexp.MustCompile(ibanPattern)
	vinRegexp      = regexp.MustCompile(vinPattern)
	uuidRegexp     = regexp.MustCompile(uuidPattern)
	uuid3Regexp    = regexp.MustCompile(uuid3Pattern)
	uuid4Regexp    = regexp.MustCompile(uuid4Pattern)
	uuid5Regexp    = regexp.MustCompile(uuid5Pattern)
	urlRegexp      = regexp.MustCompile(urlPattern)
	filenameRegexp = regexp.MustCompile(filenamePattern)
	// repeatingNumRegexp    = regexp.MustCompile(repeatingNumPattern) -- Breaks on tinygo
	beginsWithZeroRegexp  = regexp.MustCompile(beginWithZeroPattern)
	containsLettersRegexp = regexp.MustCompile(containsLettersPattern)
	containsSpacesRegexp  = regexp.MustCompile(containsSpacesPattern)
)

func matchtestcreditcard(s string) bool {
	switch s {
	case "4242424242424242",
		"4012888888881881",
		"4000056655665556",
		"5555555555554444",
		"5200828282828210",
		"5105105105105100",
		"378282246310005",
		"371449635398431",
		"6011111111111117",
		"6011000990139424",
		"30569309025904",
		"38520000023237",
		"3530111333300000",
		"3566002020360505":
		return true
	default:
		return false
	}
}

func matchluhn(s string) bool {
	baseMatches := creditCardBaseRegexp.FindAllString(s, -1)
	for _, match := range baseMatches {
		noDash := strings.Replace(match, `-`, ``, -1)
		noSpace := strings.Replace(noDash, ` `, ``, -1)
		if matchtestcreditcard(noSpace) {
			continue
		}
		if luhn(noSpace) {
			return true
		}
	}
	return false
}

// Breaks on tinygo
//func matchaltcreditcard(s string) bool {
//	return altCreditCardRegexp.MatchString(s)
//}

func matchindiapan(s string) bool {
	return indiaPanRegexp.MatchString(s)
}

func matchcontainswhitespace(s string) bool {
	return containsSpacesRegexp.MatchString(s)
}

func matchcontainsletters(s string) bool {
	return containsLettersRegexp.MatchString(s)
}

func matchbeginswithzero(s string) bool {
	return beginsWithZeroRegexp.MatchString(s)
}

// Breaks on tinygo
//func matchrepeatingnumber(s string) bool {
//	return repeatingNumRegexp.MatchString(s)
//}

func matchfilename(s string) bool {
	return filenameRegexp.MatchString(s)
}

func matchphone(s string) bool {
	return phoneRegexp.MatchString(s)
}

func matchphonesWithExts(s string) bool {
	return phonesWithExtsRegexp.MatchString(s)
}

func matchlink(s string) bool {
	return linkRegexp.MatchString(s)
}

func matchemail(s string) bool {
	return emailRegexp.MatchString(s)
}

func matchipv4(s string) bool {
	return ipv4Regexp.MatchString(s)
}

func matchipv6(s string) bool {
	return ipv6Regexp.MatchString(s)
}

func matchip(s string) bool {
	return ipRegexp.MatchString(s)
}

func matchcreditCard(s string) bool {
	return creditCardRegexp.MatchString(s)
}

func matchstreetAddress(s string) bool {
	return streetAddressRegexp.MatchString(s)
}

func matchzipCode(s string) bool {
	return zipCodeRegexp.MatchString(s)
}

func matchpoBox(s string) bool {
	return poBoxRegexp.MatchString(s)
}

func matchssn(s string) bool {
	return ssnRegexp.MatchString(s)
}

func matchguid(s string) bool {
	return guidRegexp.MatchString(s)
}

func matchvisaCreditCard(s string) bool {
	return visaCreditCardRegexp.MatchString(s)
}

func matchmcCreditCard(s string) bool {
	return mcCreditCardRegexp.MatchString(s)
}

func matchiban(s string) bool {
	return ibanRegexp.MatchString(s)
}

func matchvin(s string) bool {
	return vinRegexp.MatchString(s)
}

func matchuuid(s string) bool {
	return uuidRegexp.MatchString(s)
}

func matchuuid3(s string) bool {
	return uuid3Regexp.MatchString(s)
}

func matchuuid4(s string) bool {
	return uuid4Regexp.MatchString(s)
}

func matchuuid5(s string) bool {
	return uuid5Regexp.MatchString(s)
}

func matchurl(s string) bool {
	return urlRegexp.MatchString(s)
}

func matchusbankrouting(s string) bool {
	for _, bc := range usbanks {
		if bc.MatchString(s) {
			return true
		}
	}
	return false
}

func luhn(s string) bool {
	var sum int
	var alternate bool
	numberLen := len(s)
	if numberLen < 13 || numberLen > 19 {
		return false
	}
	for i := numberLen - 1; i > -1; i-- {
		mod, _ := strconv.Atoi(string(s[i]))
		if alternate {
			mod *= 2
			if mod > 9 {
				mod = (mod % 10) + 1
			}
		}
		alternate = !alternate
		sum += mod
	}
	return sum%10 == 0
}
