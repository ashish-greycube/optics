frappe.ui.form.on('Sales Invoice', {
	onload(frm) {
		frm.set_query('right_lens_cf', () => {
			return {
				filters: {
					has_variants: 1
				}
			}
		})
		frm.set_query('left_lens_cf', () => {
			return {
				filters: {
					has_variants: 1
				}
			}
		})
		frm.get_field("optic_measurement_cf").grid.cannot_add_rows = true;
		$('[data-fieldname="optic_measurement_cf"]').find('.grid-remove-rows').hide()
		$('[data-fieldname="optic_measurement_cf"]').find('.grid-remove-all-rows').hide()

		if (frm.is_new() == 1) {
			frm.optic_measurement_cf = []
			var child = frm.add_child("optic_measurement_cf");
			frappe.model.set_value(child.doctype, child.name, "r_lens_type", "Distance")
			frappe.model.set_value(child.doctype, child.name, "l_lens_type", "Distance")
			var child = frm.add_child("optic_measurement_cf");
			frappe.model.set_value(child.doctype, child.name, "r_lens_type", "Reading")
			frappe.model.set_value(child.doctype, child.name, "l_lens_type", "Reading")
			var child = frm.add_child("optic_measurement_cf");
			frappe.model.set_value(child.doctype, child.name, "r_lens_type", "IPD")
			frappe.model.set_value(child.doctype, child.name, "l_lens_type", "ADD")

			var r_lens_type_df = frappe.meta.get_docfield("Optic Measurement CD", "r_lens_type", frm.doc.name);
			var l_lens_type_df = frappe.meta.get_docfield("Optic Measurement CD", "l_lens_type", frm.doc.name);
			r_lens_type_df.read_only = 1;
			l_lens_type_df.read_only = 1;
			frm.refresh_field("optic_measurement_cf")

		}
	},
	fetch_items_cf(frm) {
		if (frm.doc.customer == undefined) {
			frappe.msgprint(__('Please specify customer to fetch item details'));
			return false
		}

		var right_lens_cf = frm.doc.right_lens_cf
		var left_lens_cf = frm.doc.left_lens_cf
		if (right_lens_cf == undefined && left_lens_cf == undefined) {
			frappe.msgprint(__('Please specify right or left lense to fetch item details'));
			return false
		}	

			
		// row 1
		var r_sph_1 = frm.doc.optic_measurement_cf[0].r_sph
		var r_cyl_1 = frm.doc.optic_measurement_cf[0].r_cyl
		var l_sph_1 = frm.doc.optic_measurement_cf[0].l_sph
		var l_cyl_1 = frm.doc.optic_measurement_cf[0].l_cyl
		// row 2
		var r_sph_2 = frm.doc.optic_measurement_cf[1].r_sph
		var r_cyl_2 = frm.doc.optic_measurement_cf[1].r_cyl
		var l_sph_2 = frm.doc.optic_measurement_cf[1].l_sph
		var l_cyl_2 = frm.doc.optic_measurement_cf[1].l_cyl

		if (right_lens_cf != undefined && r_sph_1 == undefined && r_cyl_1 == undefined && r_sph_2 == undefined && r_cyl_2 == undefined  ) {
			frappe.msgprint(__('Please specify distance or reading  values of right lense to fetch item details'));
			return false
		}	

		if (left_lens_cf != undefined && l_sph_1 == undefined && l_cyl_1 == undefined && l_sph_2 == undefined && l_cyl_2 == undefined  ) {
			frappe.msgprint(__('Please specify distance or reading  values of left lense to fetch item details'));
			return false
		}	

		if (frm.doc.items.length>0) {
			frm.doc.items=[]
			frm.refresh_field('items')
		}		
//  decide lens type
if (right_lens_cf!=undefined) {
	

let right_lens_type='';
frappe.call({
	method: "erpnext.portal.product_configurator.utils.get_attributes_and_values",
	args: {
		item_code: right_lens_cf
	},
	callback: function (r) {
		if (!r.exc) {
			console.log('r.message.length',r.message.length)
			if (r.message.length==4) {
				right_lens_type='ByFocal'
			}
			else if(r.message.length==2){
				right_lens_type= 'Maxima'
			}else{
				frappe.throw(__('Something went wrong..lens type couldn\'t be determined.'));
			}
			if (right_lens_type == 'ByFocal') {
				if (r_sph_1 == undefined || r_cyl_1 == undefined || r_sph_2 == undefined || r_cyl_2 == undefined) {
					frappe.msgprint(__('For ByFocal, please enter distance and reading values for right lens'));
					return false
				} else {
					var items = {
						'SPHD': r_sph_1,
						'CYLD': r_cyl_1,
						'SPHR': r_sph_2,
						'CYLR': r_cyl_2
					};
					console.log(1)
					frappe.call({
						method: "optics.api.get_item_codes_by_attributes_cf",
						args: {
							attribute_filters: items,
							template_item_code: right_lens_cf,
						},
						callback: function (r) {
							if (!r.exc) {
								var item_code = r.message[0]
								if (item_code) {
									var child = frm.add_child("items");
									frappe.model.set_value(child.doctype, child.name, "item_code", item_code)
									frm.refresh_field("items")
								} else {
									frappe.msgprint(__('No ByFocal item found for these values of right lens '))
								}
							}
						}
					});
				}
			}
			if (right_lens_type == 'Maxima' || right_lens_type == 'Altima') {
				if ((r_sph_1 != undefined && r_cyl_1 == undefined) || (r_sph_1 == undefined && r_cyl_1 != undefined)) {
					frappe.msgprint(__('For {0}, right lense please enter both SPH and CYL distance values', [right_lens_cf]));
					return false
				} 
				// distance
				if (r_sph_1 != undefined && r_cyl_1 != undefined){
						var items = {
							'SPH': r_sph_1,
							'CYL': r_cyl_1,
						};
						console.log(2)
					frappe.call({
						method: "optics.api.get_item_codes_by_attributes_cf",
						args: {
							attribute_filters: items,
							template_item_code: right_lens_cf,
						},
						callback: function (r) {
							if (!r.exc) {
								var item_code = r.message[0]
								if (item_code) {
									var child = frm.add_child("items");
									frappe.model.set_value(child.doctype, child.name, "item_code", item_code)
									frm.refresh_field("items")
								} else {
									frappe.msgprint(__('No {0} item found for distance values of right lens ', [right_lens_cf]))
								}
							}
						}
					});
				}
				}
			
			if (right_lens_type == 'Maxima' || right_lens_type == 'Altima') {
				 if ((r_sph_2 != undefined && r_cyl_2 == undefined) || (r_sph_2 == undefined && r_cyl_2 != undefined)) {
					frappe.msgprint(__('For {0}, right lense please enter both SPH and CYL reading values', [right_lens_cf]));
					return false
				} 
				if (r_sph_2 != undefined && r_cyl_2 != undefined){
						//  reading
						var items = {
							'SPH': r_sph_2,
							'CYL': r_cyl_2,
						};
						console.log(3)
					frappe.call({
						method: "optics.api.get_item_codes_by_attributes_cf",
						args: {
							attribute_filters: items,
							template_item_code: right_lens_cf,
						},
						callback: function (r) {
							if (!r.exc) {
								var item_code = r.message[0]
								if (item_code) {
									var child = frm.add_child("items");
									frappe.model.set_value(child.doctype, child.name, "item_code", item_code)
									frm.refresh_field("items")
								} else {
									frappe.msgprint(__('No {0} item found for reading values of right lens ', [right_lens_cf]))
								}
							}
						}
					});
				}

				}
		}
	}
});
}

if (left_lens_cf!=undefined) {
let left_lens_type='';
frappe.call({
	method: "erpnext.portal.product_configurator.utils.get_attributes_and_values",
	args: {
		item_code: left_lens_cf
	},
	callback: function (r) {
		if (!r.exc) {
			console.log('r.message.length',r.message.length)
			if (r.message.length==4) {
				left_lens_type='ByFocal'
			}
			else if(r.message.length==2){
				left_lens_type= 'Maxima'
			}else{
				frappe.throw(__('Something went wrong..lens type couldn\'t be determined.'));
			}
			if (left_lens_type == 'ByFocal') {
				if (l_sph_1 == undefined || l_cyl_1 == undefined || l_sph_2 == undefined || l_cyl_2 == undefined) {
					frappe.msgprint(__('For ByFocal, please enter distance and reading values for left lens'));
					return false
				} else {
					var items = {
						'SPHD': l_sph_1,
						'CYLD': l_cyl_1,
						'SPHR': l_sph_2,
						'CYLR': l_cyl_2
					};
					console.log(4)
					frappe.call({
						method: "optics.api.get_item_codes_by_attributes_cf",
						args: {
							attribute_filters: items,
							template_item_code: left_lens_cf,
						},
						callback: function (r) {
							if (!r.exc) {
								var item_code = r.message[0]
								if (item_code) {
									var child = frm.add_child("items");
									frappe.model.set_value(child.doctype, child.name, "item_code", item_code)
									frm.refresh_field("items")
								} else {
									frappe.msgprint(__('No ByFocal item found for these values of left lens '))
								}
							}
						}
					});
				}
			} 
	
			if (left_lens_type == 'Maxima' || left_lens_type == 'Altima') {
				if ((l_sph_1 != undefined && l_cyl_1 == undefined) || (l_sph_1 == undefined && l_cyl_1 != undefined)) {
					frappe.msgprint(__('For {0}, left lense please enter both SPH and CYL distance values', [left_lens_cf]));
					return false
				} 
				if (l_sph_1 != undefined && l_cyl_1 != undefined)	{
				// distance
						var items = {
							'SPH': l_sph_1,
							'CYL': l_cyl_1,
						};
						console.log(5)
					frappe.call({
						method: "optics.api.get_item_codes_by_attributes_cf",
						args: {
							attribute_filters: items,
							template_item_code: left_lens_cf,
						},
						callback: function (r) {
							if (!r.exc) {
								var item_code = r.message[0]
								if (item_code) {
									var child = frm.add_child("items");
									frappe.model.set_value(child.doctype, child.name, "item_code", item_code)
									frm.refresh_field("items")
								} else {
									frappe.msgprint(__('No {0} item found for distance values of left lens ', [left_lens_cf]))
								}
							}
						}
					});
				}
				}

				if (left_lens_type == 'Maxima' || left_lens_type == 'Altima') {
					if ((l_sph_2 != undefined && l_cyl_2 == undefined) || (l_sph_2 == undefined && l_cyl_2 != undefined)) {
						   frappe.msgprint(__('For {0}, left lense please enter both SPH and CYL reading values', [left_lens_cf]));
						   return false
					   } 
					   if (l_sph_2 != undefined && l_cyl_2 != undefined) {
					   //  reading
							   var items = {
								   'SPH': l_sph_2,
								   'CYL': l_cyl_2,
							   };
							   console.log(6)
						   frappe.call({
							   method: "optics.api.get_item_codes_by_attributes_cf",
							   args: {
								   attribute_filters: items,
								   template_item_code: left_lens_cf,
							   },
							   callback: function (r) {
								   if (!r.exc) {
									   var item_code = r.message[0]
									   if (item_code) {
										   var child = frm.add_child("items");
										   frappe.model.set_value(child.doctype, child.name, "item_code", item_code)
										   frm.refresh_field("items")
									   } else {
										   frappe.msgprint(__('No {0} item found for these values of left lens ', [left_lens_cf]))
									   }
								   }
							   }
						   });
						}	
						
						}

		}}});


	}
 

		

		},
		
	
})
