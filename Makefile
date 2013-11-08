build: components index.js template.js
	@component build --dev
	@component build --standalone touchscaler --name touchscaler

template.js: template.html
	@component convert $<

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean
