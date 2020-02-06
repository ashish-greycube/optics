import frappe
from erpnext.portal.product_configurator.utils import get_item_codes_by_attributes

@frappe.whitelist(allow_guest=True)
def get_item_codes_by_attributes_cf(attribute_filters, template_item_code=None):
	attribute_filters=frappe.parse_json(frappe.form_dict.attribute_filters)	
	print('-----------------------------------',attribute_filters)
	return get_item_codes_by_attributes(attribute_filters, template_item_code=None)