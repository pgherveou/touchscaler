build: components index.js
	@component build --dev
	@component build --standalone touchscaler --name touchscaler

components: component.json
	@component install --dev

clean:
	rm -fr build components

.PHONY: clean
